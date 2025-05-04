export const PAWN = 1; // -001
export const BISHOP = 2; // -010
export const KNIGHT = 3; // -011
export const ROOK = 4; // -010
export const QUEEN = 5; // -101
export const KING = 6; // -110

export const WHITE = 0; // 0---
export const BLACK = 8; // 1---


/**
 * @typedef { 0b0000 | 0b1000 } Color
 */


/**
 * Returns true if the given piece is white.
 * @param { number } piece
 * @returns { boolean }
 */
export function isWhite(piece) {
  return (piece & 0b1000) == 0;
}

/**
 * Returns true if the given piece is black.
 * @param { number } piece
 * @returns { boolean }
 */
export function isBlack(piece) {
  return !isWhite(piece);
}

/**
 * Returns true if the pieces have the same color.
 * @param { number } firstPiece
 * @param { number } secondPiece
 * @returns { boolean }
 */
export function isSameColor(firstPiece, secondPiece) {
  return !(isWhite(firstPiece) ^ isWhite(secondPiece));
}

/**
 * Returns true if the given piece exists (ie. is not empty).
 * @param { number } piece
 * @returns { boolean }
 */
export function isPiece(piece) {
  return piece != 0;
}

/**
 * Returns the type value of the given piece.
 * @param { number } piece
 * @returns { number }
 */
export function getType(piece) {
  return piece & 0b0111;
}

/**
 * Returns the color value of the given piece.
 * @param { number } piece
 * @returns { number }
 */
export function getColor(piece) {
  return piece & 0b1000;
}
