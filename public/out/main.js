import { Game } from "./chess/game.js";
import { initDraw, startUpdatingDrawing } from "./draw.js";
import { startUpdatingInput } from "./input.js";
/**
 * Runs the initialization of the window.
 */
function main() {
    initDraw().then(startGame);
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
