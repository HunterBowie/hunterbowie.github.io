export const PAWN = 1; // -001
export const BISHOP = 2; // -010
export const KNIGHT = 3; // -011
export const ROOK = 4; // -010
export const QUEEN = 5; // -101
export const KING = 6; // -110

export const WHITE = 0; // 0---
export const BLACK = 8; // 1---

export class Game {
  constructor() {
    this.board = Array.from({ length: 8 }, () => new Array(8).fill(0));
    this.heldPiece = 0;
    this.heldPieceHome = null;
    this.heldPiecePoint = null;
    this.turn = "white";
    this.initPieces();
    // more to come
  }

  initPieces() {
    this.board[1][2] = BLACK | ROOK;
    this.board[7][0] = WHITE | PAWN;
    this.board[3][2] = BLACK | KING;
    this.board[0][0] = WHITE | QUEEN;
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
