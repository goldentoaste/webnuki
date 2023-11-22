



export function col2Str(col : number, size : number = 0){
    
    return String.fromCharCode(col + 96); 
}

export function colFStr(col : string, size : number = 0){
    // size optional
    
    return col.charCodeAt(0) - 96;
}


export function row2Str(row : number, size : number){
    return (size - row) .toString();
}

export function rowFStr(row : string, size :number)
{
    return  size - parseInt(row);
}


export function coord2Str(row : number, col:number, size: number){
    return col2Str(col, size) + row2Str(row, size);
}


export function coordFStr(input:string, size : number){
    // assume values less than 26

    return [
        rowFStr(input.charAt(0), size),
        colFStr(input.charAt(1), size)
    ]
}