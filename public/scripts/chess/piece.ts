export const PAWN = 1; // -001
export const BISHOP = 2; // -010
export const KNIGHT = 3; // -011
export const ROOK = 4; // -010
export const QUEEN = 5; // -101
export const KING = 6; // -110

export const WHITE = 0; // 0---
export const BLACK = 8; // 1---

export type PieceType = 
   | typeof PAWN 
   | typeof BISHOP 
   | typeof KNIGHT 
   | typeof ROOK 
   | typeof QUEEN 
   | typeof KING;

export type PieceColor = 
  | typeof WHITE
  | typeof BLACK;


export type Piece = PieceType | PieceColor;


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
 * Returns true if the pieces have the same color.
 */
export function isSameColor(firstPiece: Piece, secondPiece: Piece): boolean {
  return isWhite(firstPiece) == isWhite(secondPiece);
}

/**
 * Returns true if the given piece exists (ie. is not empty).
 */
export function isPiece(piece: Piece): boolean {
  return piece != 0;
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
