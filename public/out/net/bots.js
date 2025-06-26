import { getPiece, makePos } from "../chess/board/core.js";
import { getMoves } from "../chess/board/moves/core.js";
import { EMPTY_PIECE, getColor } from "../chess/board/piece.js";
import { Logger } from "../logger.js";
// TODO: refactor
function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}
export function startUpdatingBotCommands(game) {
    function onBotMove() {
        Logger.log(Logger.NET, "Bot to move");
        let moves = [];
        for (let rankNum = 1; rankNum <= 8; rankNum++) {
            for (let fileNum = 1; fileNum <= 8; fileNum++) {
                const pos = makePos(rankNum, fileNum);
                const piece = getPiece(pos, game.board);
                if (piece !== EMPTY_PIECE && getColor(piece) === game.board.toMove) {
                    moves = moves.concat(getMoves(pos, game.board));
                }
            }
        }
        game.playMove(moves.at(getRandomInt(0, moves.length)));
    }
    game.onBotToMove(onBotMove);
}
