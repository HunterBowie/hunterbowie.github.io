import {
  Board,
  copyBoard,
  getPiece,
  isInvalidPos,
  isKingInCheck,
  setPiece,
} from "./board.js";
import {
  BISHOP,
  getColor,
  getType,
  isPiece,
  isSameColor,
  isWhite,
  KING,
  KNIGHT,
  PAWN,
  QUEEN,
  ROOK,
} from "./piece.js";

import { MissingPieceError } from "../errors.js";

/**
 * MOVES are just positions that a piece could go to from its current position.
 * VALID MOVES are moves that are on the board.
 * LEGAL MOVES are moves that don't endanger the king (or if the king is already in check and the move does not save the king).
 * RAW MOVES are moves that are playable moves that might or might not be ILLEGAL (they must be VALID)
 */

/**
 * A position on a chess board.
 */
export interface Pos {
  row: number;
  col: number;
}

export enum SpecialMove {
  CASTLE_KINGSIDE,
  CASTLE_QUEENSIDE,
  EN_PASSANT,
}

/**
 * A move on a chess board.
 */
export interface Move {
  start: Pos;
  end: Pos;
  special?: SpecialMove;
}

/**
 * Returns the position that the piece at the given pos can move to (including illegal moves).
 * Throws MissingPieceError if there is not piece at the given pos.
 */
export function getRawMovesForPiece(pos: Pos, board: Board): Move[] {
  let piece = getPiece(pos, board);

  if (piece == 0) {
    throw new MissingPieceError(
      "The pos: " + pos + " has no piece to get moves for."
    );
  }

  let moves: Move[] = [];
  const color = getColor(piece);

  switch (getType(piece)) {
    case PAWN:
      let direction = 1;
      if (isWhite(piece)) {
        direction = -1;
      }
      // single push
      let singlePush = {
        start: pos,
        end: { row: pos.row + direction, col: pos.col },
      };
      if (isValidAndUnoccupied(singlePush, board)) {
        moves.push(singlePush);

        // double push
        if (!hasPawnMoved(pos, piece)) {
          let doublePush = {
            start: pos,
            end: { row: pos.row + 2 * direction, col: pos.col },
          };
          if (isValidAndUnoccupied(doublePush, board)) {
            moves.push(doublePush);
          }
        }
      }

      // side moves
      let attacks = [
        { row: pos.row + direction, col: pos.col - 1 },
        { row: pos.row + direction, col: pos.col + 1 },
      ];

      attacks.forEach((endPos, _) => {
        let move = { start: pos, end: endPos };
        if (isValidAndOccupiedByEnemy(move, board)) {
          moves.push(move);
        }
      });

      break;

    case KING:
      const kingMoves = [
        { row: pos.row + 1, col: pos.col },
        { row: pos.row + 1, col: pos.col + 1 },
        { row: pos.row + 1, col: pos.col - 1 },
        { row: pos.row, col: pos.col + 1 },
        { row: pos.row, col: pos.col - 1 },
        { row: pos.row - 1, col: pos.col },
        { row: pos.row - 1, col: pos.col + 1 },
        { row: pos.row - 1, col: pos.col - 1 },
      ];

      kingMoves.forEach((endPos, _) => {
        let move = { start: pos, end: endPos };
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
        { row: pos.row - 1, col: pos.col - 2 },
        { row: pos.row + 1, col: pos.col - 2 },
        { row: pos.row + 1, col: pos.col + 2 },
        { row: pos.row - 1, col: pos.col + 2 },
        { row: pos.row - 2, col: pos.col - 1 },
        { row: pos.row + 2, col: pos.col - 1 },
        { row: pos.row + 2, col: pos.col + 1 },
        { row: pos.row - 2, col: pos.col + 1 },
      ];
      knightMoves.forEach((endPos, _) => {
        let move = { start: pos, end: endPos };
        if (isValidAndNotBlocked(move, board)) {
          moves.push(move);
        }
      });
      break;
  }

  return moves;
}

/**
 * Returns true if the king to move can castle kingside.
 * NOTE: does not check for previous states that could invalidate a castle.
 */
// function canCastleKingside(board: Board): boolean {
//   if (isKingInCheck(board)) return false;

//   const row = board.toMove === WHITE ? 7 : 0;

//   const col = 4; // kings column

//   const oneRight = { row: row, col: col + 1 };
//   const twoRight = { row: row, col: col + 2 };

//   if (getPiece(oneRight, board) != 0 || getPiece(twoRight, board) != 0) {
//     return false;
//   }

//   const spots = [{ row: row, col: col }, oneRight, twoRight];

//   if (isUnderAttack(spots, board)) {
//     return false;
//   }
//   return true;
// }

/**
 * Returns the positions that the piece at the given pos can move to.
 * Throws MissingPieceError if there is not piece at the given pos.
 * @param { Pos } pos
 * @param { number[][] } board
 * @returns { Move[] }
 */
export function getMovesForPiece(pos, board) {
  let piece = getPiece(pos, board);

  if (piece == 0) {
    throw new MissingPieceError(
      "The pos: " + pos + " has no piece to get moves for."
    );
  }

  let legalMoves: Move[] = [];

  getRawMovesForPiece(pos, board).forEach((move, _) => {
    if (isLegalMove(move, board)) {
      legalMoves.push(move);
    }
  });
  return legalMoves;
}

/**
 * Returns true if the move is legal and is not occupied.
 * @param { Move } move
 * @param { number[][] } board
 * @returns { boolean }
 */
function isValidAndUnoccupied(move, board) {
  if (isInvalidPos(move.end)) {
    return false;
  }
  let piece = getPiece(move.end, board);
  if (piece != 0) {
    return false;
  }
  return true;
}

/**
 * Returns true if the move is legal and occupied by an enemy.
 * @param { Move } move
 * @param { number[][] } board
 * @returns { boolean }
 */
function isValidAndOccupiedByEnemy(move, board) {
  if (isInvalidPos(move.end)) {
    return false;
  }
  let startPiece = getPiece(move.start, board);
  let endPiece = getPiece(move.end, board);
  if (endPiece != 0) {
    return !isSameColor(startPiece, endPiece);
  }
  return false;
}

/**
 * Returns true if the move is legal and not blocked by a friend.
 * @param { Move } move
 * @param { number[][] } board
 * @returns { boolean }
 */
function isValidAndNotBlocked(move, board) {
  if (isInvalidPos(move.end)) {
    return false;
  }
  let startPiece = getPiece(move.start, board);
  let endPiece = getPiece(move.end, board);
  if (endPiece != 0) {
    return !isSameColor(startPiece, endPiece);
  }
  return true;
}

/**
 * Returns true if the move from the start to end position is legal.
 * @param { Move } move
 * @param { Board } board
 * @returns { boolean }
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

/**
 * Returns true if the pawn has moved from its starting position.
 * @param { Pos } pos
 * @param { number } piece
 * @returns { boolean }
 */
function hasPawnMoved(pos, piece) {
  if (isWhite(piece)) {
    if (pos.row == 6) {
      return false;
    }
    return true;
  }
  if (pos.row == 1) {
    return false;
  }
  return true;
}

/**
 * Get Diagonal moves for the piece at the given position.
 * @param { Pos } pos
 * @param { number[][] } board
 * @returns { Pos[] }
 */
function getDiagonalMoves(pos, board) {
  return getSlidingMovesInDirection(pos, board, { row: 1, col: 1 })
    .concat(getSlidingMovesInDirection(pos, board, { row: -1, col: 1 }))
    .concat(getSlidingMovesInDirection(pos, board, { row: 1, col: -1 }))
    .concat(getSlidingMovesInDirection(pos, board, { row: -1, col: -1 }));
}

/**
 * Get Straight moves for the piece at the given position.
 * @param { Pos } pos
 * @param { number[][] } board
 * @returns { Pos[] }
 */
function getStraightMoves(pos, board) {
  return getSlidingMovesInDirection(pos, board, { row: 0, col: 1 })
    .concat(getSlidingMovesInDirection(pos, board, { row: 1, col: 0 }))
    .concat(getSlidingMovesInDirection(pos, board, { row: -1, col: 0 }))
    .concat(getSlidingMovesInDirection(pos, board, { row: 0, col: -1 }));
}

/**
 * Get Diagonal moves for the piece at the given position in given direction.
 * @param { Pos } pos
 * @param { number[][] } board
 * @param { Pos } direction
 * @returns { Pos[] }
 */
function getSlidingMovesInDirection(pos, board, direction) {
  let piece = getPiece(pos, board);
  let moves: Move[] = [];
  let nextPos = { row: pos.row + direction.row, col: pos.col + direction.col };
  while (true) {
    if (isInvalidPos(nextPos)) {
      break;
    }

    let nextPiece = getPiece(nextPos, board);

    if (isPiece(nextPiece) && isSameColor(nextPiece, piece)) {
      break;
    }

    moves.push({ start: pos, end: nextPos });

    // pieces are different vision is blocked
    if (isPiece(nextPiece)) {
      break;
    }

    nextPos = {
      row: nextPos.row + direction.row,
      col: nextPos.col + direction.col,
    };
  }
  return moves;
}
