import { Pos } from "../chess/board/core.js";
import { Move } from "../chess/board/moves/core.js";
import { Game } from "../chess/game.js";

const go = new (window as any).Go();

// PUBLIC FUNCTION DEFINITIONS

export function startUpdatingBotCommands(game: Game) {
  WebAssembly.instantiateStreaming(fetch("go/main.wasm"), go.importObject).then(
    async (result) => {
      go.run(result.instance);
      game.onBotToMove(() => {
        console.log("CALCULATING MOVE");

        const rawMove: string = (window as any).GetBotMove(
          "classic",
          0,
          1000,
          "rnbqkbnr/pppppppp/8/8/8/111P1111/PPP1PPPP/RNBQKBNR b KQkq - 0 1"
        );

        // NEED TO ADD FLAGS

        const move: Move = {
          start: rawMove.slice(0, 2) as Pos,
          end: rawMove.slice(2, 4) as Pos,
          attack: false,
        };

        game.playMove(move);
      });
    }
  );
}
