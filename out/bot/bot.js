import { getFEN } from "../chess/board/core.js";
import { setEval } from "../util.js";
// PUBLIC FUNCTION DEFINITIONS
export function startUpdatingBotCommands(game) {
    game.onBotToMove(() => {
        const fen = getFEN(game.board);
        console.log("SENDING: " + "'" + fen + "'");
        const now = Date.now();
        fetch(`https://hunterbowie.com/minimax/getBestMove?fen=${fen}`)
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
            const move = {
                start: rawMove.slice(0, 2),
                end: rawMove.slice(2, 4),
                flag: flag,
            };
            game.playMove(move);
            return fetch(`https://hunterbowie.com/minimax/getEval?fen=${fen}`);
        })
            .then((response) => {
            if (!response.ok) {
                throw new Error("Bot server getting eval was not OK" + response.statusText);
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
