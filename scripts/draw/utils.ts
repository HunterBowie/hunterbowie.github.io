import {
  getFileNumber,
  getRankNumber,
  makePos,
  Pos,
} from "../chess/board/core.js";
import { getCanvas } from "./core.js";

// PUBLIC FUNCTION DEFINITIONS

/**
 * Returns the width of the canvas.
 */
export function getCanvasWidth(): number {
  return Number(getCanvas().style.width.slice(0, -2));
}

/**
 * Returns the center x and y value on the canvas.
 */
export function calcXYCenter(): number {
  return getCanvasWidth() / 2;
}

/**
 * Returns the flipped version of the chess position.
 */
export function flipPos(pos: Pos): Pos {
  const rank = getRankNumber(pos);
  const file = getFileNumber(pos);
  const newRank = 9 - rank;
  return makePos(newRank, file);
}
