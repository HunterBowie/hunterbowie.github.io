import { getFEN, Pos } from "../chess/board/core.js";
import { Move } from "../chess/board/moves/core.js";
import { Game } from "../chess/game.js";
import { setEval } from "../util.js";

// PUBLIC FUNCTION DEFINITIONS

export function startUpdatingBotCommands(game: Game) {
  game.onBotToMove(() => {
    const fen = getFEN(game.board);
    console.log("SENDING: " + "'" + fen + "'");
    const now = Date.now();
    fetch(
      `http://ec2-54-176-147-174.us-west-1.compute.amazonaws.com:8080/minimax/bestmove?fen=${fen}`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Bot server was not OK" + response.statusText);
        }
        return response.json();
      })
      .then((data) => {
        console.log(`TIME ELAPSED MILLI: ${Date.now() - now}`);

        const rawMove = data["best_move"];
        const flag = data["move_flag"];

        console.log("RECIEVED: " + "'" + rawMove + "'");

        const move: Move = {
          start: rawMove.slice(0, 2) as Pos,
          end: rawMove.slice(2, 4) as Pos,
          flag: flag,
        };

        game.playMove(move);

        return fetch(
          `http://ec2-54-176-147-174.us-west-1.compute.amazonaws.com:8080/minimax/eval?fen=${fen}`
        );
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Bot server getting eval was not OK" + response.statusText
          );
        }
        return response.json();
      })
      .then((data) => {
        setEval(data["eval"]);
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  });
}
