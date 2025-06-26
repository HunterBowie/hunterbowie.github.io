import { getPiece, makePos } from "../../chess/board/core.js";
import { getMoves } from "../../chess/board/moves/core.js";
import { EMPTY_PIECE, getColor } from "../../chess/board/piece.js";
import { getRandomInt } from "../../util.js";
// DATA DEFINITIONS
// A "Bot" is a function with the signature () => void
// PUBLIC FUNCTION DEFINITIONS
export function generateTestBot(game) {
    async function onBotMove() {
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
    return onBotMove;
}
