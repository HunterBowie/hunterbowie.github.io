import { isInvalidPos, PAWN, WHITE } from "./chess.js";
import { getCanvas, getSquareWidth } from "./draw.js";

/**
 * @typedef {Object} Point
 * @property {number} x
 * @property {number} y
 */

/**
 * Get the mouse point of the event relative to the canvas.
 * @param { MouseEvent } event
 * @returns { Point }
 */
function getRelMousePoint(event) {
  const rect = getCanvas().getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  return { x: x, y: y };
}

/**
 * Starts the process of updating the board based on user input.
 * @param { number[][] } board
 */
export function startUpdatingInput(board) {
  window.addEventListener("click", (event) => {
    const point = getRelMousePoint(event);
    const row = Math.floor(point.y / getSquareWidth());
    const col = Math.floor(point.x / getSquareWidth());
    if (isInvalidPos(row, col)) {
      return;
    }
    board[row][col] = PAWN | WHITE;
  });
}
