import {
  BISHOP,
  BLACK,
  getType,
  isPiece,
  isSameColor,
  isWhite,
  KING,
  PAWN,
  QUEEN,
  ROOK,
  WHITE,
} from "./piece.js";

export class Game {
  constructor() {
    this.board = Array.from({ length: 8 }, () => new Array(8).fill(0));
    this.heldPieceSlot = { piece: 0, homePos: null, hoverPoint: null };
    this.highlightedSquares = [];
    this.turn = "white";
    this.initPieces();
    // more to come
  }

  initPieces() {
    this.board[1][2] = BLACK | QUEEN;
    this.board[7][0] = WHITE | PAWN;
    this.board[3][2] = BLACK | KING;
    this.board[0][0] = WHITE | BISHOP;
    this.board[1][1] = BLACK | PAWN;
  }
}

/**
 * Returns true if the given position is invalid
 * @param { Pos } pos
 * @returns { boolean }
 */
export function isInvalidPos(pos) {
  if (pos.row < 0 || pos.col < 0) {
    return true;
  }
  if (pos.row >= 8 || pos.col >= 8) {
    return true;
  }
  return false;
}

/**
 * Returns the positions that the piece at the given pos can move to.
 * Throws MissingPieceError if there is not piece at the given pos.
 * @param { Pos } pos
 * @param { number[][] } board
 * @returns { Pos[] }
 */
export function getMoves(pos, board) {
  let piece = board[pos.row][pos.col];

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

      // front move
      moves.push({ row: pos.row + direction, col: pos.col });

      // side moves
      let attacks = [
        { row: pos.row + direction, col: pos.col - 1 },
        { row: pos.row + direction, col: pos.col + 1 },
      ];

      attacks.forEach((pos, _) => {
        if (isInvalidPos(pos)) return;
        const attackPiece = board[pos.row][pos.col];
        if (isPiece(attackPiece) && !isSameColor(attackPiece, piece)) {
          moves.push(pos);
        }
      });

      break;

    case KING:
      let rowColShift = [0, -1, 1];
      let newMoves = moves.concat(
        rowColShift
          .map((shift) =>
            rowColShift.map((innerShift) => {
              return { row: pos.row + shift, col: pos.col + innerShift };
            })
          )
          .reduce((ar1, ar2) => ar1.concat(ar2))
      );
      newMoves.forEach((pos, _) => {
        if (isInvalidPos(pos)) {
          return;
        }
        let attackPiece = board[pos.row][pos.col];
        if (isPiece(attackPiece) && isSameColor(piece, attackPiece)) {
          return;
        }
        moves.push(pos);
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
  }
  return moves;
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
  let piece = board[pos.row][pos.col];
  let moves = [];
  let nextPos = { row: pos.row + direction.row, col: pos.col + direction.col };
  while (true) {
    if (isInvalidPos(nextPos)) {
      break;
    }

    let nextPiece = board[nextPos.row][nextPos.col];

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
