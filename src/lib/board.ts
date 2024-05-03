
import { writable } from "svelte/store";
import type { History } from "./boardLib"
import { WALL, BLACK, WHITE, EMPTY } from "./boardLib";
import { BoardRenderer } from "./boardRenderer";

interface BoardState {
    board: number[][];
    currentPlayer: number;
    playerColor: number;
    blackScore: number;
    whiteScore: number;
}

// update this when a player wins
export const winningPlayer = writable(WALL);
export const blackScore = writable(0);
export const whiteScore = writable(0);
export const currentPlayer = writable(WALL);
export const lastPlay = writable<number[] | undefined>(undefined);
export const playerColor = writable(WALL)
export const boardSize = writable(9);
export const history = writable<History[]>([]);
export const historyIndex = writable<number>(-1);

const dirs = [
    [1, 1],
    [0, 1],
    [1, 0],
    [1, -1]
];

const dirSigned = [
    ...dirs,
    ...[[-1, -1],
    [0, -1],
    [-1, 0],
    [-1, 1]]
]


export function opponent(color: number) {
    return (color % 2) + 1;
}

export function colorToName(color: number) {
    if (color == BLACK) {
        return "Black"
    }
    else {
        return "White"
    }
}


export class Board {

    size = 0;
    board: number[][] = [];

    playerColor = BLACK;
    currentPlayer = BLACK;
    winningPlayer = EMPTY;

    blackScore = 0;
    whiteScore = 0;

    selfPlay = false;

    historyArr: History[] = [];
    historyIndex = -1;


    hoverpos = [0, 0]


    renderer: BoardRenderer;
    width = 0;

    constructor(size: number, canvas: HTMLCanvasElement) {
        this.initialize(size)
        this.renderer = new BoardRenderer(size, canvas, this);

        canvas.addEventListener("mousemove", this.hoverEvent.bind(this))
        canvas.addEventListener("mouseup", this.clickEvent.bind(this))

        this.width = this.renderer.canvas.width;
    }

    initialize(size: number) {
        this.size = size;
        this.board = [];
        boardSize.set(size);
        for (let i = 0; i < size + 2; i++) {
            let row = Array(size + 2);
            row.fill(0);
            this.board = [...this.board, row];
        }

        this.board[0].fill(WALL);
        this.board[size + 1].fill(WALL);

        for (let i = 0; i < size + 2; i++) {
            this.board[i][0] = WALL;
            this.board[i][size + 1] = WALL;
        }




    }

    changeSize(size: number) {

        this.initialize(size)
        this.reset(this.playerColor, false);

        this.renderer.changeSize(size);


    }

    addToHistory(h: History) {
        this.historyArr.push(h);
        this.historyIndex++;
        historyIndex.set(this.historyIndex)
        history.set(this.historyArr)
    }

    applyHistory(h: History) {
        console.log("applying", h);

        this.board[h.position[0]][h.position[1]] = h.color;

        let count = 0;
        for (let [row, col] of h.captures) {
            this.board[row][col] = EMPTY;
            count++;
        }
        this.updateScore(h.color, count);
        this.currentPlayer = opponent(h.color);

    }

    undoHistory(h: History) {
        this.board[h.position[0]][h.position[1]] = EMPTY;
        const opColor = opponent(h.color);

        let count = 0;
        for (let [row, col] of h.captures) {
            this.board[row][col] = opColor;
            count++;
        }
        this.updateScore(h.color, -count);
        this.currentPlayer = h.color;


    }

    updateWinner(winner: number) {
        if (winner == EMPTY && this.winningPlayer == EMPTY) { return }
        this.winningPlayer = winner;
        winningPlayer.set(winner);
    }


    rewind(index: number) {
        // reverses the gamestate after

        if (this.historyIndex == -1 || index < 0 || index >= this.historyArr.length) {
            return;
        }

        let diff = index - this.historyIndex;

        console.log(diff);


        while (diff > 0 && this.historyIndex < this.historyArr.length) {
            this.historyIndex++;
            this.applyHistory(this.historyArr[this.historyIndex]);
            diff--;
        }


        while (diff < 0 && this.historyIndex >= 0) {

            this.undoHistory(this.historyArr[this.historyIndex]);
            this.historyIndex--;
            diff++;
        }

        history.set(this.historyArr);
        historyIndex.set(this.historyIndex)
        console.log(this.currentPlayer);

        currentPlayer.set(this.currentPlayer)

        // check if we need to undo or redo a player winning after applying history
        this.updateWinner(this.historyArr[this.historyIndex].winner)
        this.rerender()
    }

    deleteFuture(index: number) {
        if (index == -1) {
            this.historyArr = []
        }
        else {
            console.log(index, this.historyArr.length - index);

            this.historyArr = this.historyArr.splice(0, index + 1);
        }
        this.historyIndex = index;
        history.set(this.historyArr);
    }

    saveState(): BoardState {
        return {
            board: this.board,
            currentPlayer: this.currentPlayer,
            playerColor: this.playerColor,
            blackScore: this.blackScore,
            whiteScore: this.whiteScore
        }
    }

    restoreState(state: BoardState) {
        this.board = state.board;
        this.currentPlayer = state.currentPlayer;
        this.playerColor = state.playerColor;
        this.blackScore = state.blackScore;
        this.whiteScore = state.whiteScore;
    }

    reset(color: number, changePlayer = false) {
        // TODO reset actions
        this.playerColor = color;
        playerColor.set(color)

        this.currentPlayer = BLACK;
        currentPlayer.set(BLACK);

        this.blackScore = 0;
        blackScore.set(0)

        this.whiteScore = 0
        whiteScore.set(0)

        winningPlayer.set(EMPTY);
        this.winningPlayer = EMPTY;

        lastPlay.set(undefined);

        for (let r = 1; r < this.size + 1; r++) {
            for (let c = 1; c < this.size + 1; c++) {
                this.board[r][c] = EMPTY;
            }
        }


        this.deleteFuture(-1)
        this.rerender()

    }

    rerender() {
        this.renderer.rerender = true;
    }


    playMove(row: number, col: number) {
        this.board[row][col] = this.currentPlayer;
        // check for five in a row
        let hasFive = false;
        for (let dir of dirs) {
            const [drow, dcol] = dir;
            let count = 1;
            let index = 1;
            while (this.board[row + drow * index][col + dcol * index] == this.currentPlayer && count < 5) {
                count += 1
                index += 1
            }
            index = 1

            while (this.board[row - drow * index][col - dcol * index] == this.currentPlayer && count < 5) {
                count += 1
                index += 1
            }

            if (count == 5) {
                hasFive = true;
                break;
            }
        }

        if (hasFive) {

            this.rerender()
            let h: History = {
                captures: [],
                color: this.currentPlayer,
                position: [row, col],
                winner: this.currentPlayer
            }
            this.addToHistory(h)

            return this.setWinner();
        }
        // check capture

        let opColor = opponent(this.currentPlayer);
        let captures = 0;
        let capturePos: number[][] = [];

        for (let dir of dirSigned) {
            const [drow, dcol] = dir;

            if (
                this.board[row + drow][col + dcol] === opColor &&
                this.board[row + drow * 2][col + dcol * 2] === opColor &&
                this.board[row + drow * 3][col + dcol * 3] === this.currentPlayer
            ) {

                this.board[row + drow][col + dcol] = EMPTY;
                this.board[row + drow * 2][col + dcol * 2] = EMPTY;
                captures += 2;

                capturePos.push([row + drow, col + dcol]);
                capturePos.push([row + drow * 2, col + dcol * 2]);
            }
        }
        if (this.currentPlayer === BLACK) {
            this.blackScore += captures;
            blackScore.set(this.blackScore);

        }
        else {
            this.whiteScore += captures;
            whiteScore.set(this.whiteScore);
        }

        if (this.blackScore >= 10 || this.whiteScore >= 10) {

            this.rerender()
            let h: History = {
                captures: capturePos,
                color: this.currentPlayer,
                position: [row, col],
                winner: this.currentPlayer

            }
            this.addToHistory(h)
            return this.setWinner();
        }

        let h: History = {
            captures: capturePos,
            color: this.currentPlayer,
            position: [row, col],
            winner: EMPTY
        }
        this.addToHistory(h)

        this.currentPlayer = opColor;
        currentPlayer.set(opColor);

        this.rerender()
    }

    setWinner() {
        this.winningPlayer = this.currentPlayer;
        winningPlayer.set(this.currentPlayer);
    }


    updateScore(color: number, change: number) {
        if (color == BLACK) {
            this.blackScore += change;
            blackScore.set(this.blackScore);
        }
        else if (color == WHITE) {
            this.whiteScore += change;
            whiteScore.set(this.whiteScore)
        }
    }




    gapSize(width: number) {
        return Math.round(width / (this.size + 1));
    }

    roundToNearestPoint(x: number, y: number) {
        const gap = this.gapSize(this.width);
        const row = Math.floor((y + gap / 2) / gap);
        const col = Math.floor((x + gap / 2) / gap);
        return [row, col];
    }


    clickEvent(e: MouseEvent) {
        const [row, col] = this.roundToNearestPoint(e.offsetX, e.offsetY);


        if (e.button !== 0) {
            return
        }
        if ((this.currentPlayer != this.playerColor && !this.selfPlay) || this.board[row][col] != EMPTY || this.historyIndex != this.historyArr.length - 1) {
            return;
        }
        this.playMove(row, col);
        lastPlay.set([row, col])
    }

    clamp(value: number, min: number, max: number) {
        return Math.min(Math.max(value, min), max)
    }

    hoverEvent(e: MouseEvent) {
        const point = this.roundToNearestPoint(this.clamp(e.offsetX, 0, this.width), this.clamp(e.offsetY, 0, this.width));

        if (point[0] != this.hoverpos[0] || point[1] != this.hoverpos[1]) {
            // only trigger rerender if hover position has changed
            this.hoverpos = point;

            this.rerender()

        }
    }


}