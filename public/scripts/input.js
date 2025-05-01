import { getMoves, isInvalidPos } from "./chess/game.js";
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
  let heldSlot = game.heldPieceSlot;

  window.addEventListener("mousedown", (event) => {
    const pos = getMousePos(event);
    if (isInvalidPos(pos)) {
      return;
    }
    const piece = board[pos.row][pos.col];
    if (piece == 0) {
      return;
    }
    game.highlightedSquares = getMoves(pos, board);
    heldSlot.piece = piece;
    board[pos.row][pos.col] = 0;
    heldSlot.homePos = pos;
    heldSlot.hoverPoint = getMousePoint(event);
  });

  window.addEventListener("mouseup", (event) => {
    const pos = getMousePos(event);
    if (isInvalidPos(pos)) {
      // return piece to orginal square
      board[heldSlot.homePos.row][heldSlot.homePos.col] = heldSlot.piece;
      game.heldPieceSlot = { piece: 0, homePos: null, hoverPoint: null };
      heldSlot = game.heldPieceSlot;
      return;
    }
    if (heldSlot.piece != 0) {
      board[pos.row][pos.col] = heldSlot.piece;
      game.heldPieceSlot = { piece: 0, homePos: null, hoverPoint: null };
      heldSlot = game.heldPieceSlot;
    }
    game.highlightedSquares = [];
  });

  window.addEventListener("mousemove", (event) => {
    if (heldSlot.piece != 0) {
      heldSlot.hoverPoint = getMousePoint(event);
    }
  });
}
