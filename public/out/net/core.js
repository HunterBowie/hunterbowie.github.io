import { generateTestBot } from "./bots/test.js";
// PUBLIC FUNCTION DEFINITIONS
export function startUpdatingBotCommands(game) {
    game.onBotToMove(generateTestBot(game));
}
