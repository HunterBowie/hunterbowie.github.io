export const PAWN = 1; // -001
export const BISHOP = 2; // -010
export const KNIGHT = 3; // -011
export const ROOK = 4; // -010
export const QUEEN = 5; // -101
export const KING = 6; // -110

export const WHITE = 0; // 0---
export const BLACK = 8; // 1---

export let board = Array.from({ length: 8 }, () => new Array(8).fill(0));

board[1][2] = BLACK | ROOK;
board[7][0] = WHITE | PAWN;
board[3][2] = BLACK | KING;
board[0][0] = WHITE | QUEEN;

/**
 * Returns true if the given position is invalid
 * @param { number } row
 * @param { number } col
 * @returns { boolean }
 */
export function isInvalidPos(row, col) {
  if (row < 0 || col < 0) {
    return true;
  }
  if (row >= 8 || col >= 8) {
    return true;
  }
  return false;
}
