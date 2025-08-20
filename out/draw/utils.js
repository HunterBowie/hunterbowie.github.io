import { getFileNumber, getRankNumber, makePos, } from "../chess/board/core.js";
import { getCanvas } from "./core.js";
// PUBLIC FUNCTION DEFINITIONS
/**
 * Returns the width of the canvas.
 */
export function getCanvasWidth() {
    return Number(getCanvas().style.width.slice(0, -2));
}
/**
 * Returns the center x and y value on the canvas.
 */
export function calcXYCenter() {
    return getCanvasWidth() / 2;
}
/**
 * Returns the flipped version of the chess position.
 */
export function flipPos(pos) {
    const rank = getRankNumber(pos);
    const file = getFileNumber(pos);
    const newRank = 9 - rank;
    return makePos(newRank, file);
}
