import { getFileNumber, getPiece, getRankNumber, makePos, } from "../chess/board/core.js";
import { EMPTY_PIECE } from "../chess/board/piece.js";
import { BLACK, DARK_SQUARE, DEBUG, DEBUG_SQUARE, DRAW_DELAY, END_PANEL_BLACK, LIGHT_SQUARE, SPECIAL_ORANGE, SPECIAL_PURPLE, SPECIAL_YELLOW, TOP_PANEL_HEIGHT, } from "../constants.js";
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
 *
 */
function drawTopPanel(game) {
    const canvasWidth = getCanvasWidth();
    drawRect(SPECIAL_YELLOW, 0, 0, canvasWidth, TOP_PANEL_HEIGHT);
    drawRect(BLACK, 0, TOP_PANEL_HEIGHT - 1, canvasWidth, 1);
    // display evaluation, bot type, moves played
    const LABEL_HEIGHT = TOP_PANEL_HEIGHT / 3;
    const VALUE_HEIGHT = LABEL_HEIGHT * 2;
    const FONT_SIZE = 15;
    const FIRST_X = Math.round(canvasWidth / 4);
    drawText("Chess Bot", FIRST_X, LABEL_HEIGHT, FONT_SIZE, true);
    drawText("Bot Evaluation", FIRST_X * 2, LABEL_HEIGHT, FONT_SIZE, true);
    drawText("Moves", FIRST_X * 3, LABEL_HEIGHT, FONT_SIZE, true);
    drawText("Classic Minimax", FIRST_X, VALUE_HEIGHT, FONT_SIZE);
    drawText("-32.2", FIRST_X * 2, VALUE_HEIGHT, FONT_SIZE);
    drawText("15", FIRST_X * 3, VALUE_HEIGHT, FONT_SIZE);
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
            drawTileWithColor(move.end, SPECIAL_PURPLE);
        });
    }
    if (game.hasSelectedPiece()) {
        drawTileWithColor(game.selected.pos, SPECIAL_PURPLE);
        game.selected.moves.forEach((move, _) => {
            drawTileWithColor(move.end, SPECIAL_PURPLE);
        });
    }
    if (DEBUG) {
        game.debugSquares.forEach((pos, _) => {
            drawTileWithColor(pos, DEBUG_SQUARE);
        });
    }
    if (game.lastMoveStart != null) {
        drawTileWithColor(game.lastMoveStart, SPECIAL_ORANGE);
        drawTileWithColor(game.lastMoveEnd, SPECIAL_ORANGE);
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
