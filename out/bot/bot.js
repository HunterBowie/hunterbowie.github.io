import { getFEN } from "../chess/board/core.js";
const go = new window.Go();
// PUBLIC FUNCTION DEFINITIONS
export function startUpdatingBotCommands(game) {
    WebAssembly.instantiateStreaming(fetch("go/main.wasm"), go.importObject).then(async (result) => {
        go.run(result.instance);
        game.onBotToMove(() => {
            console.log("CALCULATING MOVE");
            console.log(getFEN(game.board));
            const rawMove = window.GetBotMove("classic", 0, 1000, getFEN(game.board));
            // NEED TO ADD FLAGS
            const move = {
                start: rawMove.slice(0, 2),
                end: rawMove.slice(2, 4),
                attack: false,
            };
            game.playMove(move);
        });
    });
}
