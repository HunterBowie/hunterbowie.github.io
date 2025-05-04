import {
    copyBoard,
    getPiece,
    isInvalidPos,
    isKingInCheck,
    setPiece,
} from "./board.js";
import {
    BISHOP,
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

/**
 * MOVES are just positions that a piece could go to from its current position.
 * VALID MOVES are moves that are on the board.
 * LEGAL MOVES are moves that don't endanger the king (or if the king is already in check and the move does not save the king).
 */

/**
 * @typedef { Object } Pos
 * @property { number } row - the row of the position on the board
 * @property { number } col - the col of the position on the board
 */


/**
 * Returns the positions that the piece at the given pos can move to.
 * Throws MissingPieceError if there is not piece at the given pos.
 * @param { Pos } pos
 * @param { number[][] } board
 * @returns { Pos[] }
 */
export function getMovesForPiece(pos, board) {
  let piece = getPiece(pos, board);

  if (piece == 0) {
    throw new MissingPieceError(
      "The pos: " + pos + " has no piece to get moves for."
    );
  }

  let moves = [];

  switch (getType(piece)) {
    case PAWN:
      let direction = 1;
      if (isWhite(piece)) {
        direction = -1;
      }
      // double push
      if (!hasPawnMoved(pos, piece)) {
        let doublePush = { row: pos.row + 2 * direction, col: pos.col };
        if (isValidAndUnoccupied(doublePush, board)) {
          moves.push(doublePush);
        }
      }

      // single push
      let singlePush = { row: pos.row + direction, col: pos.col };
      if (isValidAndUnoccupied(singlePush, board)) {
        moves.push(singlePush);
      }

      // side moves
      let attacks = [
        { row: pos.row + direction, col: pos.col - 1 },
        { row: pos.row + direction, col: pos.col + 1 },
      ];

      attacks.forEach((pos, _) => {
        if (isValidAndOccupiedByEnemy(pos, board)) {
          moves.push(pos);
        }
      });

      break;

    case KING:
      // some craziness to get 3x3 with a hole in it
      let rowColShift = [0, -1, 1];
      let kingMoves = moves.concat(
        rowColShift
          .map((shift) =>
            rowColShift.map((innerShift) => {
              return { row: pos.row + shift, col: pos.col + innerShift };
            })
          )
          .reduce((ar1, ar2) => ar1.concat(ar2))
      );

      kingMoves.forEach((pos, _) => {
        if (isValidAndNotBlocked(pos, board)) {
          moves.push(pos);
        }
      });

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
      knightMoves.forEach((pos, _) => {
        if (isValidAndNotBlocked(pos, board)) {
          moves.push(pos);
        }
      });
      break;
  }

  let legalMoves = [];

  moves.forEach((endPos, _) => {
    if (isLegalMove(pos, endPos, board)) {
      legalMoves.push(endPos);
    }
  });
  return legalMoves;
}

/**
 * Returns true if the move is legal and is not occupied.
 * @param { Pos } pos
 * @param { number[][] } board
 * @returns { boolean }
 */
function isValidAndUnoccupied(pos, board) {
  if (isInvalidPos(pos)) {
    return false;
  }
  let piece = getPiece(pos, board);
  if (piece != 0) {
    return false;
  }
  return true;
}

/**
 * Returns true if the move is legal and occupied by an enemy.
 * @param { Pos } pos
 * @param { number[][] } board
 * @returns { boolean }
 */
function isValidAndOccupiedByEnemy(pos, board) {
  if (isInvalidPos(pos)) {
    return false;
  }
  let piece = getPiece(pos, board);
  if (piece != 0) {
    return !isSameColor(piece, board.toMove);
  }
  return false;
}

/**
 * Returns true if the move is legal and not blocked by a friend.
 * @param { Pos } pos
 * @param { number[][] } board
 * @returns { boolean }
 */
function isValidAndNotBlocked(pos, board) {
  if (isInvalidPos(pos)) {
    return false;
  }
  let piece = getPiece(pos, board);
  if (piece != 0) {
    return !isSameColor(piece, board.toMove);
  }
  return true;
}

/**
 * Returns true if the move from the start to end position is legal.
 * @param { Pos } startPos
 * @param { Pos } endPos
 * @param { Board } board
 * @returns { boolean }
 */
function isLegalMove(startPos, endPos, board) {
  let newBoard = copyBoard(board);
  let piece = getPiece(startPos, board);
  setPiece(startPos, 0, newBoard);
  setPiece(endPos, piece, newBoard);
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
  let moves = [];
  let nextPos = { row: pos.row + direction.row, col: pos.col + direction.col };
  while (true) {
    if (isInvalidPos(nextPos)) {
      break;
    }

    let nextPiece = getPiece(nextPos, board);

    if (isPiece(nextPiece) && isSameColor(nextPiece, piece)) {
      break;
    }

    moves.push(nextPos);

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
