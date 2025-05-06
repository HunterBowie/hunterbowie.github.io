import { BoardStateError, FENProcessingError } from "../errors.js";
import {
    BISHOP,
    BLACK,
    KING,
    KNIGHT,
    PAWN,
    QUEEN,
    ROOK,
    WHITE,
    getColor,
} from "./piece.js";

import { getRawMovesForPiece, Pos} from "./moves.js";


/**
 * The entire state of a chess board.
 */
export interface Board {
    /** repersentation of the chess board using a single list */
    mailbox: number[],
    /** repersents the color of the pieces to move */
    toMove: number,
    /** false if white has lost the right to castle */
    whiteCastleRights: boolean,
    /** false if black has lost the right to castle */
    blackCastleRights: boolean,
    /** the piece vulnurable to en passant otherwise null */
    enPassant: Pos | null,
    /** the number of moves made to the fifty-move rule */
    numReversibleMoves: number
}



/**
 * Creates a standard board with no moves played.
 */
export function createBoard(): Board {
  let emptyBoard = {
    mailbox: new Array(64).fill(0),
    toMove: WHITE,
    whiteCastleRights: true,
    blackCastleRights: true,
    enPassant: null,
    numReversibleMoves: 0,
  };

  loadBoardFromFEN(emptyBoard, "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");

  return emptyBoard;
}

/**
 * Modifies the given board by adding the pieces specified in the FEN notation.
 */
function loadBoardFromFEN(board: Board, fen: string) {
  let row = 0;
  let col = 0;
  for (let i = 0; i < fen.length; i++) {
    let char = fen[i];

    if (char === "/") {
      row++;
      col = 0;
      continue;
    }

    const skips = parseInt(char);
    if (!isNaN(skips)) {
      col += skips;
      continue;
    }
    let color = BLACK;
    if (char === char.toUpperCase()) {
      color = WHITE;
    }

    let type = 0;
    switch (char.toLowerCase()) {
      case "p":
        type = PAWN;
        break;
      case "b":
        type = BISHOP;
        break;
      case "n":
        type = KNIGHT;
        break;
      case "r":
        type = ROOK;
        break;
      case "q":
        type = QUEEN;
        break;
      case "k":
        type = KING;
        break;
    }
    if (type === 0) {
      throw new FENProcessingError("FEN character is incorrect: " + char);
    }
    setPiece({ row: row, col: col }, color | type, board);
    col++;
  }
}

/**
 * Returns a copy of the given board.
 */
export function copyBoard(board: Board): Board {
  return {
    mailbox: [...board.mailbox],
    toMove: board.toMove,
    whiteCastleRights: board.whiteCastleRights,
    blackCastleRights: board.blackCastleRights,
    enPassant: board.enPassant,
    numReversibleMoves: board.numReversibleMoves,
  };
}

/**
 * Returns true if the given position is invalid on a chess board.
 */
export function isInvalidPos(pos: Pos): boolean {
  if (pos.row < 0 || pos.col < 0) {
    return true;
  }
  if (pos.row >= 8 || pos.col >= 8) {
    return true;
  }
  return false;
}

/**
 * Returns the position of the king of the current toMove color.
 * Throws BoardStateError if there is no king on the board.
 */
function findKing(board: Board): Pos {
  for (let row = 0; row <= 8; row++) {
    for (let col = 0; col <= 8; col++) {
      const pos = { row: row, col: col };
      const piece = getPiece(pos, board);
      if (piece == (board.toMove | KING)) {
        return pos;
      }
    }
  }

  throw new BoardStateError("There is no King on the board");
}

/**
 * Returns true if the king is in check (of the current color).
 */
export function isKingInCheck(board: Board): boolean {
  const kingsPos = findKing(board);

  for (let row = 0; row <= 8; row++) {
    for (let col = 0; col <= 8; col++) {
      const pos = { row: row, col: col };
      const piece = getPiece(pos, board);
      if (piece != 0 && getColor(piece) != board.toMove) {
        const moves = getRawMovesForPiece(pos, board);
        for (let index = 0; index < moves.length; index++) {
          const move = moves[index];
          if (move.end.row == kingsPos.row && move.end.col == kingsPos.col) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

/**
 * Returns the index into the mailbox for the position on a chess board.
 */
function calcIndex(pos: Pos): number {
  return 8 * (7 - pos.row) + pos.col;
}

/**
 * Returns the piece on the board at the given position.
 */
export function getPiece(pos: Pos, board: Board): number {
  return board.mailbox[calcIndex(pos)];
}

/**
 * Sets the piece on the board at the given position.
 */
export function setPiece(pos: Pos, piece: number, board: Board) {
  board.mailbox[calcIndex(pos)] = piece;
}

/**
 * Change the board's to move color.
 */
export function changeToMove(board: Board) {
  if (board.toMove == WHITE) {
    board.toMove = BLACK;
  } else {
    board.toMove = WHITE;
  }
}
