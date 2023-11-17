
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


function opponent(color: number) {
    return (color % 2) + 1;
}


export class Board {

    size = 0;
    data: number[][] = [];

    playerColor = BLACK;
    currentPlayer = BLACK;
    winningPlayer = EMPTY;

    blackScore = 0;
    whiteScore = 0;

    canvas : HTMLCanvasElement;
    rerender = false;


    constructor(size: number, canvas: HTMLCanvasElement) {
        this.size = size;
        for (let i = 0; i < size + 2; i++) {
            let row = Array(size + 2);
            row.fill(0);
            this.#data = [...this.#data, row];
        }

        this.board[0].fill(WALL);
        this.board[size + 1].fill(WALL);

        for (let i = 0; i < size + 2; i++) {
            this.board[i][0] = WALL;
            this.board[i][size + 1] = WALL;
        }


        this.canvas = canvas;
        this.rerender = true;

        window.requestAnimationFrame(this.paint);
    }

    test() {
        this.board[1][1] += 1;
        this.board = this.board;
    }

    saveState(): () => BoardState {
        return {
            board: this.data,
            currentPlayer: this.currentPlayer,
            playerColor: this.playerColor,
            blackScore: this.blackScore,
            whiteScore: this.whiteScore
        }
    }

    restoreState(state: BoardState) {
        this.data = state.board;
        this.currentPlayer = state.currentPlayer;
        this.playerColor = state.playerColor;
        this.blackScore = state.blackScore;
        this.whiteScore = state.whiteScore;
    }

    reset() {
        // TODO reset actions
    }

    playMove(row: number, col: number) {
        this.data[row][col] = this.currentPlayer;
        // check for five in a row
        let hasFive = false;
        for (let dir of dirs) {
            const [drow, dcol] = dir;
            count = 1;
            index = 1;
            while (this.data[row + drow * index][row + dcol * index] == this.currentPlayer && count < 5) {
                count += 1
                index += 1
            }
            index = 1

            while (this.data[row - drow * index][row - dcol * index] == this.currentPlayer && count < 5) {
                count += 1
                index += 1
            }

            if (count == 5) {
                hasFive = true;
                break;
            }
        }

        if (hasFive) {

            return this.setWinner();
        }
        // check capture

        let opColor = opponent(this.currentPlayer);
        let captures = 0;
        for (let dir of dirSigned) {
            const [drow, dcol] = dir;

            if (
                this.data[row + drow][col + dcol] == opColor &&
                this.data[row + drow * 2][col + dcol * 2] == opColor &&
                this.data[row + drow * 3][col + dcol * 3] == opColor
            ) {
                this.data[row + drow][col + dcol] == EMPTY;
                this.data[row + drow * 2][col + dcol * 2] == EMPTY;
                captures += 2;

            }
        }

        if (this.currentPlayer == BLACK) {
            this.blackScore += captures;
            blackScore.set(this.blackScore);

        }
        else {
            this.whiteScore += captures;
            whiteScore.set(this.whiteScore);
        }

        this.currentPlayer = opColor;
        currentPlayer.set(opColor);

        if (this.blackScore >= 10 || this.whiteScore >= 10){
            return this.setWinner();
        }
    }

    setWinner() {
        this.winningPlayer = this.currentPlayer;
        winningPlayer.set(this.currentPlayer);
    }




    // canvas rendering section
    paint(){
        if (!this.rerender){
            return;
        }

        let ctx : CanvasRenderingContext2D = this.canvas.getContext();
        let w = this.canvas.width;
        let h = this.canvas.height;

        
    }

    gapSize(width: number){
        return Math.round( width / (this.size + 1));
    }

    drawBoard(ctx: CanvasRenderingContext2D,  w: number, h : number){
        // TODO cache board to an image buffer
        let gap = this.gapSize(w)

        // wood color board
        ctx.fillStyle = '#fcecbb'
        ctx.fillRect(0, 0, w, h);

        ctx.strokeStyle = "#000000";

        //draw vert lines
        for(let i = 0; i < this.size + 2; i++){
            ctx.moveTo(i * gap, 0);
            ctx.lineTo(i * gap, h)
        }

        //draw hori lines
        for(let i = 0; i < this.size + 2; i ++){
            ctx.moveTo(0, i * gap);
            ctx.lineTo(w, i * gap);
        }
    }

    drawPieces(ctx: CanvasRenderingContext2D,  w: number, h : number){
        const gap = this.gapSize(w);
        const pieceRatio = 0.8;
        const pieceRadius = Math.round(pieceRatio * gap / 2);


        for (let r = 1; r < this.size + 1; r++){
            for (let c = 1; c < this.size + 1; c++){
                const color = this.data[r][c];
                if (color == BLACK){
                    ctx.strokeStyle = "#0d0c09"
                    ctx.fillStyle = "#2b2820"
                }
                else{
                    ctx.strokeStyle = "#f5f5f5"
                    ctx.fillStyle = "#dedede"
                }
                ctx.ellipse(c * gap, r * gap, pieceRadius, pieceRadius);
            }
        }

    }

}