import { Game, PlayerType } from "./chess/game.js";
import { startUpdatingDrawing } from "./draw/chess.js";
import { initDraw } from "./draw/core.js";
import { startUpdatingInput } from "./input.js";
import { startUpdatingBotCommands } from "./bot/bot.js";
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
    let game = new Game(PlayerType.HUMAN, PlayerType.BOT);
    startUpdatingBotCommands(game);
    startUpdatingDrawing(game);
    startUpdatingInput(game);
}
window.addEventListener("load", main);
