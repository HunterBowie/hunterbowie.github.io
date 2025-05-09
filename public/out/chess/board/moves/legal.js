import { BoardStateError } from "../../../errors.js";
import { getPiece, makePos, setPiece } from "../core.js";
import { getColor, KING } from "../piece.js";
import { copyBoard } from "../utils.js";
import { getValidMoves as getAllValidMoves } from "./core.js";
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
    let legalMoves = [];
    getAllValidMoves(pos, board).forEach((move, _) => {
        if (isLegalMove(move, board)) {
            legalMoves.push(move);
        }
    });
    return legalMoves;
}
/**
 * Returns true if the king of the to move color is in check.
 * Throws BoardStateError if there is no king of that color on the board.
 * Throws BoardStateError if a board with an invalid mailbox is passed.
 */
export function isKingInCheck(board) {
    const kingsPos = findKing(board);
    for (let rankNum = 1; rankNum <= 8; rankNum++) {
        for (let fileNum = 1; fileNum <= 8; fileNum++) {
            const pos = makePos(rankNum, fileNum);
            const piece = getPiece(pos, board);
            if (piece != 0 && getColor(piece) != board.toMove) {
                const moves = getAllValidMoves(pos, board);
                for (let index = 0; index < moves.length; index++) {
                    const move = moves[index];
                    if (move.end === kingsPos) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}
// PRIVATE FUNCTION DEFINITIONS
/**
 * Returns the position of the king of the current toMove color.
 * Throws BoardStateError if there is no king on the board.
 * Throws BoardStateError if a board with an invalid mailbox is passed.
 */
function findKing(board) {
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
 * Returns true if the move is legal.
 * Throws BoardStateError if a board with an invalid mailbox is passed.
 */
function isLegalMove(move, board) {
    let newBoard = copyBoard(board);
    let startPiece = getPiece(move.start, board);
    setPiece(move.start, 0, newBoard);
    setPiece(move.end, startPiece, newBoard);
    if (isKingInCheck(newBoard)) {
        return false;
    }
    return true;
}
