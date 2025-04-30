import { isInvalidPos } from "./chess.js";
import { getCanvas, getSquareWidth } from "./draw.js";

/**
 * Get the mouse point of the event relative to the canvas.
 * @param { MouseEvent } event
 * @returns { Point }
 */
function getMousePoint(event) {
  const rect = getCanvas().getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  return { x: x, y: y };
}

/**
 * Get the mouse point of the event relative to the canvas.
 * @param { MouseEvent } event
 * @returns { Pos }
 */
function getMousePos(event) {
  const point = getMousePoint(event);
  const row = Math.floor(point.y / getSquareWidth());
  const col = Math.floor(point.x / getSquareWidth());
  return { row: row, col: col };
}

/**
 * Starts the process of updating the game based on user input.
 * @param { Game } game
 */
export function startUpdatingInput(game) {
  let board = game.board;

  window.addEventListener("mousedown", (event) => {
    const pos = getMousePos(event);
    if (isInvalidPos(pos)) {
      return;
    }
    game.heldPiece = board[pos.row][pos.col];
    board[pos.row][pos.col] = 0;
    game.heldPieceHome = pos;
    game.heldPiecePoint = getMousePoint(event);
  });

  window.addEventListener("mouseup", (event) => {
    const pos = getMousePos(event);
    if (isInvalidPos(pos)) {
      // return piece to orginal square
      board[game.heldPieceHome.row][game.heldPieceHome.col] = game.heldPiece;
      game.heldPiece = 0;
      game.heldPieceHome = null;
      game.heldPiecePoint = null;
      return;
    }
    if (game.heldPiece != 0) {
      board[pos.row][pos.col] = game.heldPiece;
      game.heldPiece = 0;
      game.heldPieceHome = null;
      game.heldPiecePoint = null;
    }
  });

  window.addEventListener("mousemove", (event) => {
    if (game.heldPiece != 0) {
      game.heldPiecePoint = getMousePoint(event);
    }
  });
}
