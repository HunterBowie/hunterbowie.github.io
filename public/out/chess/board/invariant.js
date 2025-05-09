import { DEBUG } from "../../constants.js";
import { BoardStateError } from "../../errors.js";
import { getPiece, makePos } from "./core.js";
import { BLACK, KING, PAWN, WHITE } from "./piece.js";
// PUBLIC FUNCTION DEFINTIONS
/**
 * These invariants will be checked during play by the game to ensure that any easy to
 * indentify bugs are caught early during development.
 */
/**
 * Checks if the board has invalid state when debug mode is enabled.
 * Throws BoardStateError if the board does not have valid state.
 */
export function assertBoardInvariant(board) {
    if (!DEBUG)
        return;
    if (board.mailbox.length != 64) {
        throw new BoardStateError("Board mailbox length is " + board.mailbox.length);
    }
    if (board.numHalfMoves < 0) {
        throw new BoardStateError("Board numHalfMoves is " + board.numHalfMoves);
    }
    if (board.numFullMoves < 1) {
        throw new BoardStateError("Board numFullMoves is " + board.numFullMoves);
    }
    const whiteKings = getNumKings(WHITE, board);
    if (whiteKings !== 1) {
        throw new BoardStateError(`There are ${whiteKings} white kings`);
    }
    const blackKings = getNumKings(BLACK, board);
    if (blackKings !== 1) {
        throw new BoardStateError(`There are ${blackKings} black kings`);
    }
    if (areWhitePawnOnImpossibleRank(board)) {
        throw new BoardStateError("There are white pawns on the first rank");
    }
    if (areBlackPawnOnImpossibleRank(board)) {
        throw new BoardStateError("There are black pawns on the first rank");
    }
}
// PRIVATE FUNCTION DEFINITIONS
/**
 * Returns true if a king of the given color exists in a quantity of one on the given board.
 * Throws BoardStateError if a board with an invalid mailbox is passed.
 */
function getNumKings(color, board) {
    let number = 0;
    for (let rankNum = 1; rankNum <= 8; rankNum++) {
        for (let fileNum = 1; fileNum <= 8; fileNum++) {
            const pos = makePos(rankNum, fileNum);
            const piece = getPiece(pos, board);
            if (piece === (color | KING)) {
                number++;
            }
        }
    }
    return number;
}
/**
 * Returns true if there are white pawns on the first rank.
 * Throws BoardStateError if a board with an invalid mailbox is passed.
 */
function areWhitePawnOnImpossibleRank(board) {
    const rankNum = 1;
    for (let fileNum = 1; fileNum <= 8; fileNum++) {
        const piece = getPiece(makePos(rankNum, fileNum), board);
        if (piece === (WHITE | PAWN))
            return true;
    }
    return false;
}
/**
 * Returns true if there are black pawns on the eighth rank.
 * Throws BoardStateError if a board with an invalid mailbox is passed.
 */
function areBlackPawnOnImpossibleRank(board) {
    const rankNum = 8;
    for (let fileNum = 1; fileNum <= 8; fileNum++) {
        const piece = getPiece(makePos(rankNum, fileNum), board);
        if (piece === (BLACK | PAWN))
            return true;
    }
    return false;
}
