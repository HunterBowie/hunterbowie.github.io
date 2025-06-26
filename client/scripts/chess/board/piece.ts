// DATA DEFINITIONS

/**
 * Pieces are coded in binary with the first binary digit repersenting
 * the color and the following three repersenting the type.
 *
 * The value zero is the absence of a piece.
 */

export type PieceType = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type PieceColor = 0 | 8;

export type Piece = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 9 | 10 | 11 | 12 | 13 | 14;

export const PAWN: PieceType = 1; // -001
export const BISHOP: PieceType = 2; // -010
export const KNIGHT: PieceType = 3; // -011
export const ROOK: PieceType = 4; // -010
export const QUEEN: PieceType = 5; // -101
export const KING: PieceType = 6; // -110

export const WHITE: PieceColor = 0; // 0---
export const BLACK: PieceColor = 8; // 1---

export const EMPTY_PIECE: Piece = 0;

// PUBLIC FUNCTION DEFINITIONS

/**
 * Returns true if the given piece is white.
 */
export function isWhite(piece: Piece): boolean {
  return (piece & 0b1000) == 0;
}

/**
 * Returns true if the given piece is black.
 */
export function isBlack(piece: Piece): boolean {
  return !isWhite(piece);
}


/**
 * Returns true if the piece has the given color.
 * Returns false if the piece is empty.
 */
export function isSameColor(firstPiece: Piece, secondPiece: Piece): boolean {
  return isWhite(firstPiece) === isWhite(secondPiece);
}

/**
 * Returns the type value of the given piece.
 */
export function getType(piece: Piece): PieceType {
  return (piece & 0b0111) as PieceType;
}

/**
 * Returns the color value of the given piece.
 */
export function getColor(piece: Piece): PieceColor {
  return (piece & 0b1000) as PieceColor;
}
