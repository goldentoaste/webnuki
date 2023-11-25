import { WALL, BLACK, WHITE, EMPTY } from "./boardLib";
import type { Board } from "./board";



export class BoardRenderer {

    canvas: HTMLCanvasElement;
    rerender = false;
    size = 0;
    fontMetric: TextMetrics;
    fontHeight: number;
    boardObj: Board;
    board: number[][];


    constructor (size: number, canvas: HTMLCanvasElement, boardObj: Board){
        //board should be a reference to the data structure
        // TODO implement layered rendering, so background/pieces dont have to rerender every time
        this.canvas = canvas;
        this.size = size;
        this.boardObj = boardObj;
        this.board = boardObj.board;
        const ctx = canvas.getContext("2d")
        ctx!.font = "14pt sans-serif";
        this.fontMetric = ctx!.measureText("O");
        this.fontHeight = this.fontMetric.fontBoundingBoxAscent + this.fontMetric.actualBoundingBoxDescent;


          // delayed event scheduling
          window.requestAnimationFrame(this.paint.bind(this));
     
  

        // trigger rerender
        this.rerender = true;
    }


    // canvas rendering section
    paint() {
        if (!(this.rerender)) {
            requestAnimationFrame(this.paint.bind(this))
            return;
        }

        let ctx: CanvasRenderingContext2D = this.canvas.getContext("2d", {
        })!;
        let w = this.canvas.width;
        let h = this.canvas.height;

        this.drawBoard(ctx, w, h);
        this.drawCoords(ctx, w, h)
        this.drawPieces(ctx, w, h,)
        this.drawHover(ctx, w, h)
        this.rerender = false;

        requestAnimationFrame(this.paint.bind(this));
    }

    gapSize(width: number) {
        // introduced too many floating point operations now
        // definitely gotta render in layers
        // TODO - render in layers
        return width / (this.size + 1);
    }

    drawCoords(ctx: CanvasRenderingContext2D, w: number, h: number) {
        const gap = this.gapSize(w);
        const halfGap = gap / 2;
        ctx.font = "14pt sans-serif";
        ctx.fillStyle = "#3c3836";
        ctx.textAlign = "center";



        for (let i = 1; i < this.size + 1; i++) {
            ctx.fillText(String.fromCharCode(i + 64), i * gap, halfGap);
            ctx.fillText(String.fromCharCode(i + 64), i * gap, h - halfGap + this.fontHeight);
        }

        for (let i = 1; i < this.size + 1; i++) {
            const num = this.size - i + 1;
            ctx.fillText((num) + "", halfGap - this.fontMetric.width * 0.5, i * gap + 7);
            ctx.fillText((num) + "", w - halfGap + this.fontMetric.width * 0.5, i * gap + 7);
        }
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
        for (let i = 1; i < this.size + 1; i++) {

            ctx.beginPath()
            ctx.moveTo(i * gap, gap - 1);
            ctx.lineTo(i * gap, h - gap + 1);
            ctx.stroke();
            ctx.closePath()
        }

        //draw hori lines
        for (let i = 1; i < this.size + 1; i++) {
            ctx.beginPath()
            ctx.moveTo(gap - 1, i * gap);
            ctx.lineTo(w - gap, i * gap);
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

                if (r == this.boardObj. lastMove[0] && c == this.boardObj.lastMove[1]) {
                    ctx.strokeStyle = "#fb5a48de"
                }

                ctx.beginPath()
                ctx.ellipse(c * gap, r * gap, pieceRadius, pieceRadius, 0, 0, Math.PI * 2, false);
                ctx.fill()
                ctx.stroke();
                ctx.closePath()
            }
        }
    }




    drawHover(ctx: CanvasRenderingContext2D, w: number, h: number) {

        if (this.board[this.boardObj.hoverpos[0]][this.boardObj.hoverpos[1]] != EMPTY) {
            return;
        }
        const gap = this.gapSize(w);
        const color = this.boardObj.selfPlay ? this.boardObj.currentPlayer : this.boardObj.playerColor;

        if (color == BLACK) {
            ctx.strokeStyle = "#0d0c09"
            ctx.fillStyle = "#2b282088"
        }
        else {
            ctx.strokeStyle = "#f5f5f5"
            ctx.fillStyle = "#dedede88" // slightly transparent
        }
        ctx.beginPath()
        ctx.ellipse(this.boardObj.hoverpos[1] * gap, this.boardObj.hoverpos[0] * gap, 0.4 * gap, 0.4 * gap, 0, 0, 2 * Math.PI, false);
        ctx.stroke()
        ctx.fill();
        ctx.closePath()

    }


  
}