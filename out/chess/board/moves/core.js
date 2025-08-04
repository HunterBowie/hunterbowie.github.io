import { BoardStateError } from "../../../errors.js";
import { getPiece, makePos, nextTurn, setPiece } from "../core.js";
import { EMPTY_PIECE, getColor, KING } from "../piece.js";
import { copyBoard } from "../utils.js";
import { canCastleKingside, canCastleQueenside } from "./castling.js";
import { getRawMoves } from "./raw.js";
// DATA DEFINITIONS
export const NoFlag = 0;
export const EnPassantFlag = 1;
export const CastleKingsideFlag = 2;
export const CastleQueensideFlag = 3;
export const PromoteToQueenFlag = 4;
export const PromoteToRookFlag = 5;
export const PromoteToBishopFlag = 6;
export const PromoteToKnightFlag = 7;
export const PawnDoublePushFlag = 8;
export const BreaksCastlingRightsFlag = 9;
/**
 * A special type of chess move.
 *
 * A move is special if it does not simply move from start to end and capture
 * any piece at the end.
 *
 * This will let the game know what to do if it encounters a move that requires multiple
 * pieces to move ect.
 */
// export enum SpecialMove {
//   CASTLE_KINGSIDE,
//   CASTLE_QUEENSIDE,
//   EN_PASSANT,
//   OPEN_TO_EN_PASSANT,
//   PROMOTION,
//   COULD_BREAK_CASTLE_RIGHTS,
// }
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
                const attacks = getRawMoves(pos, boardCopy);
                for (let index = 0; index < attacks.length; index++) {
                    if (attacks[index].end === kingsPos) {
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
/**
 * Returns true if the to move color has no moves to play.
 * Throws BoardStateError if a board with an invalid mailbox is passed.
 */
export function noMovesPlayable(board) {
    for (let rankNum = 1; rankNum <= 8; rankNum++) {
        for (let fileNum = 1; fileNum <= 8; fileNum++) {
            const pos = makePos(rankNum, fileNum);
            const piece = getPiece(pos, board);
            if (piece !== EMPTY_PIECE && getColor(piece) === board.toMove) {
                if (getMoves(pos, board).length > 0) {
                    return false;
                }
            }
        }
    }
    return true;
}
// PRIVATE FUNCTION DEFINITIONS
/**
 * Returns true if the move is legal.
 * Throws BoardStateError if a board with an invalid mailbox is passed.
 */
function isLegalMove(move, board) {
    if (move.flag === CastleKingsideFlag) {
        return canCastleKingside(board);
    }
    if (move.flag == CastleQueensideFlag) {
        return canCastleQueenside(board);
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
