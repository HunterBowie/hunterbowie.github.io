import { board } from "./chess.js";
import { initDraw, updateDrawingAtInterval } from "./draw.js";

/**
 * Runs the chess game.
 */
function main() {
  initDraw();
  updateDrawingAtInterval(board);
}

window.addEventListener("load", main);
