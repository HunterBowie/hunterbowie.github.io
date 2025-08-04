import { getFEN, Pos } from "../chess/board/core.js";
import { Move } from "../chess/board/moves/core.js";
import { Game } from "../chess/game.js";

const go = new (window as any).Go();

// PUBLIC FUNCTION DEFINITIONS

export function startUpdatingBotCommands(game: Game) {
  WebAssembly.instantiateStreaming(fetch("go/main.wasm"), go.importObject).then(
    async (result) => {
      go.run(result.instance);
      game.onBotToMove(() => {
        setTimeout(() => {
          console.log("SENDING: " + getFEN(game.board));

          const data: string = (window as any).GetBotMove(
            "classic",
            0,
            1000,
            getFEN(game.board)
          );

          const parts = data.split("-");

          const rawMove = parts[0];
          const flag = Number(parts[1]);

          console.log("RECIEVED: " + data);

          const move: Move = {
            start: rawMove.slice(0, 2) as Pos,
            end: rawMove.slice(2, 4) as Pos,
            flag: flag,
          };

          game.playMove(move);
        }, 100);
      });
    }
  );
}
