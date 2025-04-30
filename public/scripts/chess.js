
const PAWN = 1;   // -001 
const BISHOP = 2; // -010
const KNIGHT = 3; // -011
const ROOK = 4;   // -010
const QUEEN = 5;  // -101
const KING = 6;   // -110

const WHITE = 0; // 0---
const BLACK = 8; // 1---


export let board = Array.from({ length: 8 }, () => new Array(8).fill(0));

board[1][2] = BLACK | ROOK;