import { BoardStateError } from "../../../errors.js";
import { getPiece, makePos, nextTurn, setPiece } from "../core.js";
import { EMPTY_PIECE, getColor, KING } from "../piece.js";
import { copyBoard } from "../utils.js";
import { canCastleKingside } from "./castling.js";
import { getRawMoves } from "./raw.js";
/**
 * A special type of chess move.
 *
 * A move is special if it does not simply move from start to end and capture
 * any piece at the end.
 *
 * This will let the game know what to do if it encounters a move that requires multiple
 * pieces to move ect.
 */
export var SpecialMove;
(function (SpecialMove) {
    SpecialMove[SpecialMove["CASTLE_KINGSIDE"] = 0] = "CASTLE_KINGSIDE";
    SpecialMove[SpecialMove["CASTLE_QUEENSIDE"] = 1] = "CASTLE_QUEENSIDE";
    SpecialMove[SpecialMove["EN_PASSANT"] = 2] = "EN_PASSANT";
    SpecialMove[SpecialMove["OPEN_TO_EN_PASSANT"] = 3] = "OPEN_TO_EN_PASSANT";
    SpecialMove[SpecialMove["PROMOTION"] = 4] = "PROMOTION";
    SpecialMove[SpecialMove["COULD_BREAK_CASTLE_RIGHTS"] = 5] = "COULD_BREAK_CASTLE_RIGHTS";
})(SpecialMove || (SpecialMove = {}));
// PUBLIC FUNCTION DEFINITIONS
/**
 * LEGAL moves that if played would not put the players king in check.
 */
/**
 * Returns the positions that the piece at the given pos can move to.
 * These moves are legal, meaning that they can be played according to the
 * rules of chess.
 * Throws MissingPieceError if there is not piece at the given pos.
 * Throws BoardStateError if a board with an invalid mailbox is passed.
 */
export function getMoves(pos, board) {
    return getRawMoves(pos, board).filter((move) => isLegalMove(move, board));
}
/**
 * Returns true if the king of the to move color is in check.
 * Throws BoardStateError if there is no king of that color on the board.
 * Throws BoardStateError if a board with an invalid mailbox is passed.
 */
export function isKingInCheck(board) {
    const kingsPos = findKingPos(board);
    // must be done to get moves for enemy pieces
    const boardCopy = copyBoard(board);
    nextTurn(boardCopy);
    for (let rankNum = 1; rankNum <= 8; rankNum++) {
        for (let fileNum = 1; fileNum <= 8; fileNum++) {
            const pos = makePos(rankNum, fileNum);
            const piece = getPiece(pos, board);
            if (piece !== EMPTY_PIECE && getColor(piece) !== board.toMove) {
                const moves = getRawMoves(pos, boardCopy);
                for (let index = 0; index < moves.length; index++) {
                    if (moves[index].end === kingsPos) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}
/**
 * Returns the position of the king of the current toMove color.
 * Throws BoardStateError if there is no king on the board.
 * Throws BoardStateError if a board with an invalid mailbox is passed.
 */
export function findKingPos(board) {
    for (let rankNum = 1; rankNum <= 8; rankNum++) {
        for (let fileNum = 1; fileNum <= 8; fileNum++) {
            const pos = makePos(rankNum, fileNum);
            const piece = getPiece(pos, board);
            if (piece === (board.toMove | KING)) {
                return pos;
            }
        }
    }
    throw new BoardStateError("There is no King on the board");
}
// PRIVATE FUNCTION DEFINITIONS
/**
 * Returns true if the move is legal.
 * Throws BoardStateError if a board with an invalid mailbox is passed.
 */
function isLegalMove(move, board) {
    if (move.special === SpecialMove.CASTLE_KINGSIDE) {
        return canCastleKingside(board);
    }
    if (move.special == SpecialMove.CASTLE_QUEENSIDE) {
        // pass
    }
    let newBoard = copyBoard(board);
    let startPiece = getPiece(move.start, board);
    setPiece(move.start, 0, newBoard);
    setPiece(move.end, startPiece, newBoard);
    if (isKingInCheck(newBoard)) {
        return false;
    }
    return true;
}
