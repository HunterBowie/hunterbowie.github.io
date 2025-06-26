import { getFileNumber, getPiece, getRankNumber, makePos, } from "../chess/board/core.js";
import { EMPTY_PIECE } from "../chess/board/piece.js";
import { DARK_SQUARE, DEBUG, DEBUG_SQUARE, DRAW_DELAY, END_PANEL_BLACK, LIGHT_SQUARE, SPECIAL_PURPLE, SPECIAL_YELLOW, } from "../constants.js";
import { drawRect, drawText, getContext, getSquareWidth, pieceImages, } from "./core.js";
import { calcXYCenter, getCanvasWidth } from "./utils.js";
/**
 * Starts a process of updating the drawings.
 */
export function startUpdatingDrawing(game) {
    setInterval(() => {
        drawBoardTiles();
        drawHighlightedBoardTiles(game);
        drawBoardPieces(game);
        drawHeldPiece(game);
        drawGameOverPanel(game);
    }, DRAW_DELAY);
}
/**
 * Draws the opaque panal over the chess board when the game ends.
 */
function drawGameOverPanel(game) {
    if (!game.isOver())
        return;
    const canvasWidth = getCanvasWidth();
    drawRect(END_PANEL_BLACK, 0, 0, canvasWidth, canvasWidth);
    drawText("Game Over", calcXYCenter(), calcXYCenter(), 35);
}
/**
 * Draws the chess board background.
 */
function drawBoardTiles() {
    for (let rankNum = 1; rankNum <= 8; rankNum++) {
        for (let fileNum = 1; fileNum <= 8; fileNum++) {
            let color = (rankNum + fileNum) % 2 === 0 ? LIGHT_SQUARE : DARK_SQUARE;
            drawTileWithColor(makePos(rankNum, fileNum), color);
        }
    }
}
/**
 * Draws the chess board pieces.
 */
function drawBoardPieces(game) {
    const squareWidth = getSquareWidth();
    for (let rankNum = 1; rankNum <= 8; rankNum++) {
        for (let fileNum = 1; fileNum <= 8; fileNum++) {
            const pos = makePos(rankNum, fileNum);
            const piece = getPiece(pos, game.board);
            if (piece === EMPTY_PIECE) {
                continue;
            }
            drawPieceImage(getPiece(pos, game.board), (fileNum - 1) * squareWidth, (8 - rankNum) * squareWidth);
        }
    }
}
/**
 * Draws the squares highlighting nessesary board tiles.
 */
function drawHighlightedBoardTiles(game) {
    if (game.isHoldingPiece()) {
        drawTileWithColor(game.held.home, SPECIAL_PURPLE);
        game.held.moves.forEach((move, _) => {
            drawTileWithColor(move.end, SPECIAL_YELLOW);
        });
    }
    if (game.hasSelectedPiece()) {
        drawTileWithColor(game.selected.pos, SPECIAL_PURPLE);
        game.selected.moves.forEach((move, _) => {
            drawTileWithColor(move.end, SPECIAL_YELLOW);
        });
    }
    if (DEBUG) {
        game.debugSquares.forEach((pos, _) => {
            drawTileWithColor(pos, DEBUG_SQUARE);
        });
    }
}
/**
 * Draws the currently held piece if there is one.
 */
function drawHeldPiece(game) {
    if (!game.isHoldingPiece())
        return;
    const halfPieceWidth = Math.floor(getSquareWidth() / 2);
    drawPieceImage(game.held.piece, game.held.hover.x - halfPieceWidth, game.held.hover.y - halfPieceWidth);
}
/**
 * Draws a tile with the given color at the given position)
 */
function drawTileWithColor(pos, color) {
    drawRect(color, (getFileNumber(pos) - 1) * getSquareWidth(), (8 - getRankNumber(pos)) * getSquareWidth(), getSquareWidth(), getSquareWidth());
}
/**
 * Draws an image to the context (better for a single image).
 */
export function drawPieceImage(piece, x, y) {
    const squareWidth = getSquareWidth();
    getContext().drawImage(pieceImages[piece], x, y, squareWidth, squareWidth);
}
