
import { writable } from "svelte/store";
import type { History } from "./boardLib"
import { WALL, BLACK, WHITE, EMPTY } from "./boardLib";
import { BoardRenderer } from "./boardRenderer";
import { render } from "svelte/server";


interface BoardState {
    board: number[][];
    currentPlayer: number;
    playerColor: number;
    blackScore: number;
    whiteScore: number;
}






// update this when a player wins
export const winningPlayer = writable(EMPTY);
export const blackScore = writable(0);
export const whiteScore = writable(0);
export const currentPlayer = writable(BLACK);
export const lastPlay = writable<number[] | undefined>(undefined);
export const playerColor = writable(BLACK)
export const boardSize = writable(9);
export const history = writable<History[]>([]);

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
    historyIndex = 0;


    hoverpos = [0, 0]
    lastMove = [-1, -1]

    renderer: BoardRenderer;
    width = 0;

    constructor(size: number, canvas: HTMLCanvasElement) {
        this.size = size;
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

        this.renderer = new BoardRenderer(size, canvas, this);

        canvas.addEventListener("mousemove", this.hoverEvent.bind(this))
        canvas.addEventListener("mouseup", this.clickEvent.bind(this))

        this.width = this.renderer.canvas.width;


    }

    addToHistory(h: History) {
        this.historyArr.push(h);
        this.historyIndex++;
        history.set(this.historyArr)
    }

    applyHistory(h: History) {
        this.board[h.position[0]][h.position[1]] = h.color;

        let count = 0;
        for (let [row, col] of h.captures) {
            this.board[row][col] = EMPTY;
            count++;
        }
        this.updateScore(h.color, count);
        this.currentPlayer = opponent(h.color);

        this.updateWinner(h.winner)
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

        this.updateWinner(h.winner)
    }

    updateWinner(winner: number) {
        if (winner == EMPTY) { return }
        this.winningPlayer = winner;
        winningPlayer.set(winner);
    }


    rewind(index: number) {
        // reverses the gamestate after

        let diff = index - this.historyIndex;


        while (diff > 0 && this.historyIndex < this.historyArr.length) {
            this.historyIndex++;
            this.applyHistory(this.historyArr[this.historyIndex]);
            diff--;
        }


        while (diff < 0 && this.historyIndex >= 0) {
            this.historyIndex--;
            this.undoHistory(this.historyArr[this.historyIndex]);
            diff++;
        }

        history.set(this.historyArr);
    }

    deleteFuture(index: number) {
        this.historyArr = this.historyArr.splice(index);
        history.set(this.historyArr);
    }


    test() {
        this.board[1][1] += 1;
        this.board = this.board;
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

    reset(color: number) {
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
        this.rerender()

    }

    rerender() {
        this.renderer.rerender = true;
    }


    playMove(row: number, col: number) {
        this.board[row][col] = this.currentPlayer;
        this.lastMove = [row, col]
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
            winner: this.currentPlayer
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
        // if ( this.board[row][col] != EMPTY ) {
        //     return;
        // }
        if ((this.currentPlayer != this.playerColor && !this.selfPlay) || this.board[row][col] != EMPTY) {
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