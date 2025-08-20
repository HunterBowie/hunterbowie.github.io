import { startUpdatingBotCommands } from "./bot/bot.js";
import { Game, PlayerType } from "./chess/game.js";
import { startUpdatingDrawing } from "./draw/chess.js";
import { initDraw } from "./draw/core.js";
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
  const whitePlayer = Math.round(Math.random());
  const blackPlayer = 1 - whitePlayer;
  let game = new Game(whitePlayer, blackPlayer);
  startUpdatingBotCommands(game);
  startUpdatingDrawing(game);
  startUpdatingInput(game);
}

window.addEventListener("load", main);
