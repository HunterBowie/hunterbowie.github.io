import { Game } from "./chess/game.js";
import { initDraw, startUpdatingDrawing } from "./draw.js";
import { startUpdatingInput } from "./input.js";

/**
 * Runs the initialization of the window.
 */
function main() {
  initDraw().then(startGame);
  // .catch((err) => console.error("Images failed to load with error: " + err));
}

/**
 * Begins the game.
 */
function startGame() {
  let game = new Game();
  startUpdatingDrawing(game);
  startUpdatingInput(game);
}

window.addEventListener("load", main);
