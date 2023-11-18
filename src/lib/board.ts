
// @ts-nocheck

import { writable } from "svelte/store";

interface BoardState {
    board: number[][];
    currentPlayer: number;
    playerColor: number;
    blackScore: number;
    whiteScore: number;
}

function makeItemHolder() {
    let items = $state([]);

    return {
        get items() { return items; },
        addItems(item: any) {
            items.push(item);
        }
    }
}

export const WALL = -1;
export const BLACK = 1;
export const WHITE = 2;
export const EMPTY = 0;

// update this when a player wins
export const winningPlayer = writable(EMPTY);
export const blackScore = writable(0);
export const whiteScore = writable(0);
export const currentPlayer = writable(BLACK);
export const lastPlay = writable(undefined);
export const playerColor = writable(BLACK)

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

    canvas: HTMLCanvasElement;
    rerender = false;


    constructor(size: number, canvas: HTMLCanvasElement) {
        this.size = size;
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


        this.canvas = canvas;
        this.rerender = true;

        // delayed event scheduling
        window.requestAnimationFrame(this.paint.bind(this));
        canvas.addEventListener("mousemove", this.hoverEvent.bind(this))
        canvas.addEventListener("mouseup", this.clickEvent.bind(this))
    }

    test() {
        this.board[1][1] += 1;
        this.board = this.board;
    }

    saveState(): () => BoardState {
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

        this.rerender = true;

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
            this.rerender = true;
            console.log("WIN WIN WIN");

            return this.setWinner();
        }
        // check capture

        let opColor = opponent(this.currentPlayer);
        let captures = 0;

        for (let dir of dirSigned) {
            const [drow, dcol] = dir;

            if (
                this.board[row + drow][col + dcol] === opColor &&
                this.board[row + drow * 2][col + dcol * 2] === opColor &&
                this.board[row + drow * 3][col + dcol * 3] === this.currentPlayer
            ) {
                console.log("yikes!");

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

        this.currentPlayer = opColor;
        currentPlayer.set(opColor);

        if (this.blackScore >= 10 || this.whiteScore >= 10) {
            this.rerender = true;
            return this.setWinner();
        }
        this.rerender = true;
    }

    setWinner() {
        this.winningPlayer = this.currentPlayer;
        winningPlayer.set(this.currentPlayer);
    }




    // canvas rendering section
    paint() {
        if (!(this.rerender)) {
            requestAnimationFrame(this.paint.bind(this))
            return;
        }

        let ctx: CanvasRenderingContext2D = this.canvas.getContext("2d", {
        });
        let w = this.canvas.width;
        let h = this.canvas.height;

        this.drawBoard(ctx, w, h);
        this.drawPieces(ctx, w, h,)
        this.drawHover(ctx, w, h)
        this.rerender = false;

        requestAnimationFrame(this.paint.bind(this));
    }

    gapSize(width: number) {
        return Math.round(width / (this.size + 1));
    }

    drawBoard(ctx: CanvasRenderingContext2D, w: number, h: number) {
        // TODO cache board to an image buffer
        let gap = this.gapSize(w)

        // wood color board
        ctx.fillStyle = '#fcecbb'
        ctx.fillRect(0, 0, w, h);

        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 1

        //draw vert lines
        for (let i = 0; i < this.size + 2; i++) {

            ctx.beginPath()
            ctx.moveTo(i * gap, 0);
            ctx.lineTo(i * gap, h);
            ctx.stroke();
            ctx.closePath()
        }

        //draw hori lines
        for (let i = 0; i < this.size + 2; i++) {
            ctx.beginPath()
            ctx.moveTo(0, i * gap);
            ctx.lineTo(w, i * gap);
            ctx.stroke();
            ctx.closePath()
        }
    }

    drawPieces(ctx: CanvasRenderingContext2D, w: number, h: number) {
        const gap = this.gapSize(w);
        const pieceRatio = 0.8;
        const pieceRadius = Math.round(pieceRatio * gap / 2);

        ctx.lineWidth = 2
        for (let r = 1; r < this.size + 1; r++) {
            for (let c = 1; c < this.size + 1; c++) {
                const color = this.board[r][c];
                if (color == EMPTY) { continue; }
                if (color == BLACK) {
                    ctx.strokeStyle = "#0d0c09"
                    ctx.fillStyle = "#2b2820"
                }
                else {
                    ctx.strokeStyle = "#f5f5f5"
                    ctx.fillStyle = "#dedede"
                }
                ctx.beginPath()
                ctx.ellipse(c * gap, r * gap, pieceRadius, pieceRadius, 0, 0, Math.PI * 2, false);
                ctx.fill()
                ctx.stroke();
                ctx.closePath()
            }
        }
    }

    hoverpos = [0, 0]

    roundToNearestPoint(x, y) {
        const gap = this.gapSize(this.canvas.width);
        const row = Math.floor((y + gap / 2) / gap);
        const col = Math.floor((x + gap / 2) / gap);
        return [row, col];
    }

    drawHover(ctx: CanvasRenderingContext2D, w: number, h: number) {

        if (this.board[this.hoverpos[0]][this.hoverpos[1]] != EMPTY) {
            return;
        }
        const gap = this.gapSize(w);
        if (this.playerColor == BLACK) {
            ctx.strokeStyle = "#0d0c09"
            ctx.fillStyle = "#2b282088"
        }
        else {
            ctx.strokeStyle = "#f5f5f5"
            ctx.fillStyle = "#dedede88" // slightly transparent
        }
        ctx.beginPath()
        ctx.ellipse(this.hoverpos[1] * gap, this.hoverpos[0] * gap, 0.4 * gap, 0.4 * gap, 0, 0, 2 * Math.PI, false);
        ctx.stroke()
        ctx.fill();
        ctx.closePath()

    }


    hoverEvent(e: MouseEvent) {
        const point = this.roundToNearestPoint(e.offsetX, e.offsetY);
        if (point[0] != this.hoverpos[0] || point[1] != this.hoverpos[1]) {
            // only trigger rerender if hover position has changed
            this.hoverpos = point;
            this.rerender = true;
        }
    }

    clickEvent(e: MouseEvent) {
        const [row, col] = this.roundToNearestPoint(e.offsetX, e.offsetY);
        if ( this.board[row][col] != EMPTY ) {
            return;
        }
        // if (this.currentPlayer != this.playerColor || this.board[row][col] != EMPTY ) {
        //     return;
        // }
        this.playMove(row, col);
        lastPlay.set([row, col])
    }

}