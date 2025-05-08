export type PieceType = 1 | 2 | 3 | 4 | 5 | 6;

export type PieceColor = 0 | 8;

export type Piece = PieceType | PieceColor;

export const PAWN: PieceType = 1; // -001
export const BISHOP: PieceType = 2; // -010
export const KNIGHT: PieceType = 3; // -011
export const ROOK: PieceType = 4; // -010
export const QUEEN: PieceType = 5; // -101
export const KING: PieceType = 6; // -110

export const WHITE: PieceColor = 0; // 0---
export const BLACK: PieceColor = 8; // 1---
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
