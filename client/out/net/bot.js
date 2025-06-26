import { generateTestBot } from "./bots/test.js";
export function startUpdatingBotCommands(game) {
    game.onBotToMove(generateTestBot(game));
}
