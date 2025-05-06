import { getPiece } from "../chess/board.js";
import { Game } from "../chess/game.js";
import { Pos } from "../chess/moves.js";
import {
  DARK_SQUARE,
  DRAW_DELAY,
  LIGHT_SQUARE,
  SPECIAL_PURPLE,
  SPECIAL_YELLOW,
} from "../constants.js";
import { drawPieceImage, drawRect, getSquareWidth } from "./core.js";

/**
 * Starts a process of updating the drawings.
 */
export function startUpdatingDrawing(game: Game) {
  setInterval(() => {
    drawBoardTiles();
    drawHighlightedBoardTiles(game);
    drawBoardPieces(game);
    drawHeldPiece(game);
  }, DRAW_DELAY);
}

/**
 * Draws the chess board background.
 */
function drawBoardTiles() {
  const squareWidth = getSquareWidth();
  for (let row = 0; row <= 8; row++) {
    for (let col = 0; col <= 8; col++) {
      let color = DARK_SQUARE;
      if ((row + col) % 2 === 0) {
        color = LIGHT_SQUARE;
      }
      drawTileWithColor({ row: row, col: col }, color);
    }
  }
}

/**
 * Draws the chess board pieces.
 */
function drawBoardPieces(game: Game) {
  const squareWidth = getSquareWidth();
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (getPiece({ row: row, col: col }, game.board) == 0) {
        continue;
      }
      drawPieceImage(
        getPiece({ row: row, col: col }, game.board),
        col * squareWidth,
        row * squareWidth
      );
    }
  }
}

/**
 * Draws the squares highlighting nessesary board tiles.
 */
function drawHighlightedBoardTiles(game: Game) {
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
}

/**
 * Draws the currently held piece if there is one.
 */
function drawHeldPiece(game: Game) {
  if (!game.isHoldingPiece()) return;

  const halfPieceWidth = Math.floor(getSquareWidth() / 2);
  drawPieceImage(
    game.held.piece,
    game.held.hover.x - halfPieceWidth,
    game.held.hover.y - halfPieceWidth
  );
}

/**
 * Draws a tile with the given color at the given position)
 */
function drawTileWithColor(pos: Pos, color: string) {
  drawRect(
    color,
    pos.col * getSquareWidth(),
    pos.row * getSquareWidth(),
    getSquareWidth(),
    getSquareWidth()
  );
}
