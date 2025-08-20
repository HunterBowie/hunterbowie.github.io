import { getFEN } from "../chess/board/core.js";
import { PlayerType } from "../chess/game.js";
import { setEval } from "../util.js";
const go = new window.Go();
// PUBLIC FUNCTION DEFINITIONS
export function startUpdatingBotCommands(game) {
    WebAssembly.instantiateStreaming(fetch("go/main.wasm"), go.importObject)
        .then(async (result) => {
        go.run(result.instance);
        game.onBotToMove(() => {
            setTimeout(() => {
                console.log("SENDING: " + "'" + getFEN(game.board) + "'");
                const data = window.GetBotMove("classic", 0, 2000, getFEN(game.board));
                const parts = data.split("-");
                const rawMove = parts[0];
                const flag = Number(parts[1]);
                console.log("RECIEVED: " + "'" + data + "'");
                const move = {
                    start: rawMove.slice(0, 2),
                    end: rawMove.slice(2, 4),
                    flag: flag,
                };
                game.playMove(move);
                const evalRaw = window.GetBotEval("classic", 0, getFEN(game.board));
                setEval(Number(evalRaw));
            }, 100);
        });
    })
        .then((result) => {
        if (game.playerTypeWhite === PlayerType.BOT) {
            game.callWhenBotToMove();
        }
    });
}
