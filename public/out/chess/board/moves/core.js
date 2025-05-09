import { MissingPieceError, PositionShiftError } from "../../../errors.js";
import { getPiece, getRankNumber, shiftPos } from "../core.js";
import { BISHOP, EMPTY_PIECE, getType, isSameColor, isWhite, KING, KNIGHT, PAWN, QUEEN, ROOK, } from "../piece.js";
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
    SpecialMove[SpecialMove["PROMOTION"] = 3] = "PROMOTION";
})(SpecialMove || (SpecialMove = {}));
// PUBLIC FUNCTION DEFINITIONS
/**
 * Move Terminology:
 *
 * ILLEGAL: moves that if played would put the players king in check.
 * INVALID: moves that are off of the board or don't have piece at the starting position.
 */
// TODO:
/**
 * Returns all moves that the given piece can make which are valid.
 * These moves may be illegal.
 * Throws MissingPieceError if there is not piece at the given pos.
 * Throws BoardStateError if a board with an invalid mailbox is passed.
 */
export function getValidMoves(pos, board) {
    // helps make new moves that are shifted from the original position quickly
    // returns null if the move is invalid
    function createMove(rankShift, fileShift, special) {
        let move;
        try {
            move = { start: pos, end: shiftPos(pos, rankShift, fileShift) };
        }
        catch (error) {
            if (error instanceof PositionShiftError) {
                return null;
            }
            throw error;
        }
        if (special === undefined) {
            return move;
        }
        move.special = special;
        return move;
    }
    let piece = getPiece(pos, board);
    if (piece === EMPTY_PIECE) {
        throw new MissingPieceError("The pos: " + pos + " has no piece to get moves for.");
    }
    let moves = [];
    switch (getType(piece)) {
        case PAWN:
            let direction = isWhite(piece) ? 1 : -1;
            // single push
            const singlePush = createMove(direction, 0);
            if (isValidAndUnoccupied(singlePush, board)) {
                moves.push(singlePush);
                // double push
                if (!hasPawnMoved(pos, piece)) {
                    const doublePush = createMove(2 * direction, 0);
                    if (isValidAndUnoccupied(doublePush, board)) {
                        moves.push(doublePush);
                    }
                }
            }
            // side moves
            let attacks = [createMove(direction, -1), createMove(direction, 1)];
            attacks.forEach((move, _) => {
                if (isValidAndOccupiedByEnemy(move, board)) {
                    moves.push(move);
                }
            });
            break;
        case KING:
            const kingMoves = [
                createMove(1, 0),
                createMove(1, 1),
                createMove(1, -1),
                createMove(-1, 0),
                createMove(-1, 1),
                createMove(-1, -1),
                createMove(0, 1),
                createMove(0, -1),
            ];
            kingMoves.forEach((move, _) => {
                if (isValidAndNotBlocked(move, board)) {
                    moves.push(move);
                }
            });
            // castling
            //   let couldCastleKingside = board.blackCastleRightsKingside;
            //   let couldCastleQueenside = board.blackCastleRightsQueenside;
            //   if (color === WHITE) {
            //     couldCastleKingside = board.whiteCastleRightsKingside;
            //     couldCastleQueenside = board.whiteCastleRightsQueenside;
            //   }
            //   if (couldCastleKingside) {
            //     if (canCastleKingside(board)) {
            //       moves.push({ start: pos, end: { row: pos.row, col: pos.col + 2 } });
            //     }
            //   }
            break;
        case BISHOP:
            moves = moves.concat(getDiagonalMoves(pos, board));
            break;
        case ROOK:
            moves = moves.concat(getStraightMoves(pos, board));
            break;
        case QUEEN:
            moves = moves
                .concat(getStraightMoves(pos, board))
                .concat(getDiagonalMoves(pos, board));
            break;
        case KNIGHT:
            let knightMoves = [
                createMove(1, 2),
                createMove(1, -2),
                createMove(-1, 2),
                createMove(-1, -2),
                createMove(2, 1),
                createMove(2, -1),
                createMove(-2, 1),
                createMove(-2, -1),
            ];
            knightMoves.forEach((move, _) => {
                if (isValidAndNotBlocked(move, board)) {
                    moves.push(move);
                }
            });
            break;
    }
    return moves;
}
// PRIVATE FUNCTION DEFINTIONS
/**
 * Returns true if the move is not null and the end position of the move is unoccupied.
 * Throws BoardStateError if a board with an invalid mailbox is passed.
 */
function isValidAndUnoccupied(move, board) {
    if (move == null)
        return false;
    let piece = getPiece(move.end, board);
    if (piece != 0) {
        return false;
    }
    return true;
}
/**
 * Returns true if the move is not null and the end position is occupied by an enemy.
 * Throws BoardStateError if a board with an invalid mailbox is passed.
 */
function isValidAndOccupiedByEnemy(move, board) {
    if (move == null)
        return false;
    let startPiece = getPiece(move.start, board);
    let endPiece = getPiece(move.end, board);
    if (endPiece != 0) {
        return !isSameColor(startPiece, endPiece);
    }
    return false;
}
/**
 * Returns true if the move is not null and the end position is occupied by an enemy or unoccupied.
 * Throws BoardStateError if a board with an invalid mailbox is passed.
 */
function isValidAndNotBlocked(move, board) {
    if (move == null)
        return false;
    let startPiece = getPiece(move.start, board);
    let endPiece = getPiece(move.end, board);
    if (endPiece != 0) {
        return !isSameColor(startPiece, endPiece);
    }
    return true;
}
/**
 * Returns true if the pawn has moved from its starting position.
 */
function hasPawnMoved(pos, piece) {
    if (isWhite(piece)) {
        if (getRankNumber(pos) == 2) {
            return false;
        }
        return true;
    }
    if (getRankNumber(pos) == 7) {
        return false;
    }
    return true;
}
/**
 * Get Diagonal moves for the piece at the given position.
 * Throws BoardStateError if a board with an invalid mailbox is passed.
 */
function getDiagonalMoves(pos, board) {
    return getSlidingMovesInDirection(pos, board, 1, 1)
        .concat(getSlidingMovesInDirection(pos, board, 1, -1))
        .concat(getSlidingMovesInDirection(pos, board, -1, 1))
        .concat(getSlidingMovesInDirection(pos, board, -1, -1));
}
/**
 * Get Straight moves for the piece at the given position.
 * Throws BoardStateError if a board with an invalid mailbox is passed.
 */
function getStraightMoves(pos, board) {
    return getSlidingMovesInDirection(pos, board, 0, 1)
        .concat(getSlidingMovesInDirection(pos, board, 1, 0))
        .concat(getSlidingMovesInDirection(pos, board, -1, 0))
        .concat(getSlidingMovesInDirection(pos, board, 0, -1));
}
/**
 * Get Diagonal moves for the piece at the given position in given direction.
 * Throws BoardStateError if a board with an invalid mailbox is passed.
 * Throws RangeError if the given shift values are not integers.
 */
function getSlidingMovesInDirection(pos, board, rankShift, fileShift) {
    let piece = getPiece(pos, board);
    let moves = [];
    try {
        shiftPos(pos, rankShift, fileShift);
    }
    catch (error) {
        if (error instanceof PositionShiftError) {
            return moves;
        }
        throw error;
    }
    let nextPos = shiftPos(pos, rankShift, fileShift);
    while (true) {
        let nextPiece = getPiece(nextPos, board);
        if (nextPiece != EMPTY_PIECE && isSameColor(nextPiece, piece)) {
            break;
        }
        moves.push({ start: pos, end: nextPos });
        // pieces are different vision is blocked
        if (nextPiece != EMPTY_PIECE) {
            break;
        }
        // get next position in the sliding direction
        try {
            nextPos = shiftPos(nextPos, rankShift, fileShift);
        }
        catch (error) {
            if (error instanceof PositionShiftError) {
                return moves;
            }
            throw error;
        }
    }
    return moves;
}
