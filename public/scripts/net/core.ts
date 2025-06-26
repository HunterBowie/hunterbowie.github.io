import { Game } from "../chess/game.js";
import { generateTestBot } from "./bots/test.js";

// PUBLIC FUNCTION DEFINITIONS

export function startUpdatingBotCommands(game: Game) {
  game.onBotToMove(generateTestBot(game));
}

