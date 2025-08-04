import { MissingPieceError, PositionShiftError } from "../../../errors.js";
import { getPiece, getRankNumber, shiftPos } from "../core.js";
import { BISHOP, EMPTY_PIECE, getColor, getType, isSameColor, isWhite, KING, KNIGHT, PAWN, QUEEN, ROOK, } from "../piece.js";
import { canCastleKingsideRaw, canCastleQueensideRaw } from "./castling.js";
import { BreaksCastlingRightsFlag, CastleKingsideFlag, CastleQueensideFlag, EnPassantFlag, NoFlag, PawnDoublePushFlag, PromoteToQueenFlag, } from "./core.js";
// DATA DEFINITIONS
// PUBLIC FUNCTION DEFINITIONS
/**
 * Move Terminology:
 *
 * ILLEGAL: moves that if played would put the players king in check.
 *
 * RAW: moves that can be played including ones that endager the king, and castling
 *      moves that cannot be played because of attacking enemy pieces
 *
 * ATTACK: moves that result in the end square of the move having its piece removed
 *         if it has a piece at that location
 */
/**
 * Returns all raw moves for a given piece on the board.
 * These moves may be illegal.
 * The moves returned include castling when it may be possible
 * Throws MissingPieceError if there is not piece at the given pos.
 * Throws BoardStateError if a board with an invalid mailbox is passed.
 * Throws RangeError if given piece is not the color of the to move color.
 */
export function getRawMoves(pos, board, attackOnly = false) {
    // helps make new moves that are shifted from the original position quickly
    // returns null if the move is invalid
    function createMove(rankShift, fileShift, flag = NoFlag) {
        let move;
        try {
            move = {
                start: pos,
                end: shiftPos(pos, rankShift, fileShift),
                flag: flag,
            };
        }
        catch (error) {
            if (error instanceof PositionShiftError) {
                return null;
            }
            throw error;
        }
        if (flag === NoFlag) {
            return move;
        }
        move.flag = flag;
        return move;
    }
    let piece = getPiece(pos, board);
    if (piece === EMPTY_PIECE) {
        throw new MissingPieceError("The pos: " + pos + " has no piece to get moves for.");
    }
    if (getColor(piece) !== board.toMove) {
        throw new RangeError("Given piece is not the color of board.toMove: " + board.toMove);
    }
    let moves = [];
    switch (getType(piece)) {
        case PAWN:
            let direction = isWhite(piece) ? 1 : -1;
            // side moves
            let attacks = [createMove(direction, -1), createMove(direction, 1)];
            attacks.forEach((move, _) => {
                if (isValidAndOccupiedByEnemy(move, board)) {
                    if ([1, 8].includes(getRankNumber(move.end))) {
                        move.flag = PromoteToQueenFlag;
                    }
                    moves.push(move);
                }
            });
            // single push
            const singlePush = createMove(direction, 0);
            if (isValidAndUnoccupied(singlePush, board) && !attackOnly) {
                if ([1, 8].includes(getRankNumber(singlePush.end))) {
                    singlePush.flag = PromoteToQueenFlag;
                }
                moves.push(singlePush);
                // double push
                if (!hasPawnMoved(pos, piece)) {
                    const doublePush = createMove(2 * direction, 0, PawnDoublePushFlag);
                    if (isValidAndUnoccupied(doublePush, board)) {
                        moves.push(doublePush);
                    }
                }
            }
            if (board.enPassant !== null && !attackOnly) {
                // potential en passant
                attacks.forEach((move, _) => {
                    if (move === null)
                        return;
                    if (move.end === board.enPassant) {
                        if (!moves.some((move) => move.end === board.enPassant)) {
                            moves.push({
                                start: move.start,
                                end: move.end,
                                flag: EnPassantFlag,
                            });
                        }
                    }
                });
            }
            break;
        case KING:
            const kingMoves = [
                createMove(1, 0, BreaksCastlingRightsFlag),
                createMove(1, 1, BreaksCastlingRightsFlag),
                createMove(1, -1, BreaksCastlingRightsFlag),
                createMove(-1, 0, BreaksCastlingRightsFlag),
                createMove(-1, 1, BreaksCastlingRightsFlag),
                createMove(-1, -1, BreaksCastlingRightsFlag),
                createMove(0, 1, BreaksCastlingRightsFlag),
                createMove(0, -1, BreaksCastlingRightsFlag),
            ];
            kingMoves.forEach((move, _) => {
                if (isValidAndNotBlocked(move, board)) {
                    moves.push(move);
                }
            });
            const kingsideCastle = createMove(0, 2, CastleKingsideFlag);
            if (kingsideCastle !== null && !attackOnly) {
                if (canCastleKingsideRaw(board)) {
                    moves.push(kingsideCastle);
                }
            }
            const queensideCastle = createMove(0, -2, CastleQueensideFlag);
            if (queensideCastle !== null && !attackOnly) {
                if (canCastleQueensideRaw(board)) {
                    moves.push(queensideCastle);
                }
            }
            break;
        case BISHOP:
            moves = moves.concat(getDiagonalMoves(pos, board));
            break;
        case ROOK:
            getStraightMoves(pos, board).forEach((move, _) => {
                move.flag = BreaksCastlingRightsFlag;
                moves.push(move);
            });
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
        moves.push({ start: pos, end: nextPos, flag: NoFlag });
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
