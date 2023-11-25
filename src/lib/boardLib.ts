
export interface History {

    color: number,
    position: number[],
    captures: number[][]
}


export const WALL = -1;
export const BLACK = 1;
export const WHITE = 2;
export const EMPTY = 0;


export function col2Str(col: number, size: number = 0) {

    return String.fromCharCode(col + 64);
}

export function colFStr(col: string, size: number = 0) {
    // size optional

    return col.charCodeAt(0) - 64;
}


export function row2Str(row: number, size: number) {

    
    return (size - row).toString();
}

export function rowFStr(row: string, size: number) {
    return size - parseInt(row);
}


export function coord2Str(row: number, col: number, size: number) {
    return col2Str(col, size) + row2Str(row, size);
}


export function coordFStr(input: string, size: number) {
    // assume values less than 26

    return [
        rowFStr(input.charAt(0), size),
        colFStr(input.charAt(1), size)
    ]
}