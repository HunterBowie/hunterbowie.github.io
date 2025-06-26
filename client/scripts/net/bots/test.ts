import { Move } from "../../chess/board/moves/core.js";
import { Game } from "../../chess/game.js";
import { SERVER_URL } from "../../constants.js";

// DATA DEFINITIONS

// A "Bot" is a function with the signature () => void

// PUBLIC FUNCTION DEFINITIONS

export function generateTestBot(game: Game): () => void {
  return createBot(SERVER_URL + "test", game);
}

// PRIVATE FUNCTION DEFINITIONS

function createBot(url: string, game: Game): () => void {
  async function onBotMove() {
    const boardData = JSON.stringify(game.board);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: boardData,
    });

    const data = await response.json();

    const move: Move = {
      start: data.move.start,
      end: data.move.end,
      attack: data.move.attack,
    };

    game.playMove(move);
  }

  return onBotMove;
}
