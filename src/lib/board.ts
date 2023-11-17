
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

    constructor(size: number) {
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

    restoreState(state : BoardState){
        this.data = state.board;
        this.currentPlayer = state.currentPlayer;
        this.playerColor = state.playerColor;
        this.blackScore = state.blackScore;
        this.whiteScore = state.whiteScore;
    }

    reset(){
        // TODO reset actions
    }

    playMove(row : number, col:number) {
        
        this.data[row][col ] = this.currentPlayer;
        
        // check for five in a row
        

    }
}