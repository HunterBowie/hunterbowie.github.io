import {
  BoardStateError,
  FENProcessingError,
  PositionShiftError,
} from "../../errors.js";
import {
  BISHOP,
  BLACK,
  EMPTY_PIECE,
  getType,
  isWhite,
  KING,
  KNIGHT,
  PAWN,
  Piece,
  PieceColor,
  QUEEN,
  ROOK,
  WHITE,
} from "./piece.js";

// DATA DEFINITIONS

/**
 * STANDARDS FOR NOTATION:
 *
 * All positions will be passed through algebraic notation (ie. "e5")
 *
 * All moves will be passed through custom notation that has the two squares
 * on the chess board repersenting the start and end positions of the move in
 * algebraic notation (ie. "c1 b3")
 *
 * All pieces will be repersented be a number, to find the reference for how the
 * numbers code for piece color and type, refer to piece.ts
 *
 */

/**
 * The entire state of a chess board.
 */
export interface Board {
  /** repersentation of the chess board using a single list */
  mailbox: Piece[];
  /** repersents the color of the pieces to move */
  toMove: PieceColor;
  /** false if color has lost the right to castle on that side */
  whiteCastleRightsKingside: boolean;
  whiteCastleRightsQueenside: boolean;
  blackCastleRightsKingside: boolean;
  blackCastleRightsQueenside: boolean;
  /** the piece that *might be* vulnurable to en passant otherwise null */
  enPassant: Pos | null;
  /** the number of moves made to the fifty-move rule */
  numHalfMoves: number;
  /** the number of moves made starting at one */
  numFullMoves: number;
}

export type File = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h";

export type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

/**
 * A position on a chess board in algebraic notation.
 */
export type Pos = `${File}${Rank}`;

const pieceSymbols = ["p", "b", "n", "r", "q", "k", "-"];
const pieceTypes = [PAWN, BISHOP, KNIGHT, ROOK, QUEEN, KING];

// PUBLIC FUNCTION DEFINITIONS

/**
 * Returns the FEN repersentation of the board
 */
export function getFEN(board: Board): string {
  let fen = "";
  for (let rank = 8; rank >= 1; rank--) {
    let rankContent = "";
    for (let file = 1; file <= 8; file++) {
      const piece = getPiece(makePos(rank, file), board);
      if (piece == EMPTY_PIECE) {
        rankContent = rankContent + "1";
      } else {
        const pieceType = getType(piece);
        let symbol = pieceSymbols[pieceTypes.indexOf(pieceType)];
        if (isWhite(piece)) {
          symbol = symbol.toUpperCase();
        }
        rankContent = rankContent + symbol;
      }
    }
    if (rank != 1) {
      rankContent = rankContent + "/";
    }
    fen = fen + rankContent;
  }

  let activeColor = "w";

  if (board.toMove == BLACK) {
    activeColor = "b";
  }

  fen = fen + " " + activeColor;

  let castling = "";

  if (board.whiteCastleRightsKingside) {
    castling = castling + "K";
  }

  if (board.whiteCastleRightsQueenside) {
    castling = castling + "Q";
  }

  if (board.blackCastleRightsKingside) {
    castling = castling + "k";
  }
  if (board.blackCastleRightsQueenside) {
    castling = castling + "q";
  }

  if (castling == "") {
    castling = "-";
  }

  fen = fen + " " + castling;

  let enPassant = "-";

  if (board.enPassant != null) {
    enPassant = board.enPassant;
  }

  fen = fen + " " + enPassant;

  fen = fen + " " + board.numHalfMoves;
  fen = fen + " " + board.numFullMoves;

  return fen;
}

/**
 * Returns the piece at the given position on the given board.
 * Throws BoardStateError if a board with an invalid mailbox is passed.
 */
export function getPiece(pos: Pos, board: Board): Piece {
  if (board.mailbox.length != 64) {
    throw new BoardStateError(
      "The boards mailbox has the invalid length " + board.mailbox.length
    );
  }
  return board.mailbox[getIndex(pos)];
}

/**
 * Sets the piece on the given board.
 * Returns true if a piece was replaced and false if there was no piece at given position.
 * Throws BoardStateError if a board with an invalid mailbox is passed.
 */
export function setPiece(pos: Pos, piece: Piece, board: Board): boolean {
  if (board.mailbox.length != 64) {
    throw new BoardStateError(
      "The boards mailbox has the invalid length " + board.mailbox.length
    );
  }
  const index = getIndex(pos);
  const wasPiece = board.mailbox[index] != 0;
  board.mailbox[index] = piece;
  return wasPiece;
}

/**
 * Returns the position from the given rank and file numbers.
 * Throws RangeError if either the rank or file numbers are not
 * integers in the range 1-8.
 */
export function makePos(rankNumber: number, fileNumber: number): Pos {
  const range = [1, 2, 3, 4, 5, 6, 7, 8];
  if (!range.includes(rankNumber) || !range.includes(fileNumber)) {
    throw new RangeError(
      "The given rank or file numbers " +
        rankNumber +
        "," +
        fileNumber +
        " are invalid"
    );
  }
  const fileCharacter = "abcdefgh".at(fileNumber - 1);
  return `${fileCharacter}${rankNumber}` as Pos;
}

/**
 * Returns the rank number of the given position.
 * The rank number is in the range 1-8
 */
export function getRankNumber(pos: Pos): number {
  return Number(pos[1]);
}

/**
 * Returns the file number of the given position.
 * The file number is in the range 1-8
 */
export function getFileNumber(pos: Pos): number {
  return "abcdefgh".indexOf(pos[0]) + 1;
}

/**
 * Returns a position that has been shifted by the given amounts.
 * Throws RangeError if the given shift values are not integers.
 * Throws PositionShiftError if it results in a final position that is not on the board.
 */
export function shiftPos(pos: Pos, rankShift: number, fileShift: number): Pos {
  if (!Number.isInteger(rankShift)) {
    throw new RangeError("The given rankshift " + rankShift + " is invalid");
  }
  if (!Number.isInteger(fileShift)) {
    throw new RangeError("The given fileShift " + fileShift + " is invalid");
  }

  let rankNum = getRankNumber(pos);
  let fileNum = getFileNumber(pos);

  rankNum += rankShift;
  fileNum += fileShift;

  if (rankNum > 8 || fileNum > 8 || rankNum < 1 || fileNum < 1) {
    throw new PositionShiftError(
      "The given rank or file shift is resulting in a shifted position of " +
        rankNum +
        ", " +
        fileNum
    );
  }

  return makePos(rankNum, fileNum);
}

/**
 * Returns the board created by the given FEN notation.
 * Throws FENProcessingError if the given fen has the wrong number of parts
 * or includes invalid characters in the piece placement section.
 * Requires that the fen be valid in all other ways.
 */
export function loadBoardFromFEN(fen: string): Board {
  // splitting the FEN into parts
  const parts = fen.split(" ");
  if (parts.length != 6) {
    throw new FENProcessingError(
      "The given FEN '" + fen + "' has the wrong number of parts"
    );
  }
  const piecePlacement = parts[0];
  const toMove = parts[1];
  const castling = parts[2];
  const enPassant = parts[3];
  const halfMoves = parts[4];
  const fullMoves = parts[5];

  let board: Board = {
    mailbox: new Array(64).fill(0),
    toMove: toMove == "w" ? WHITE : BLACK,
    whiteCastleRightsKingside: castling.includes("K"),
    whiteCastleRightsQueenside: castling.includes("Q"),
    blackCastleRightsKingside: castling.includes("k"),
    blackCastleRightsQueenside: castling.includes("q"),
    enPassant: enPassant == "-" ? null : (enPassant as Pos),
    numHalfMoves: Number(halfMoves),
    numFullMoves: Number(fullMoves),
  };

  // adding the pieces
  let rankNum = 8;
  let fileNum = 1;
  for (let i = 0; i < piecePlacement.length; i++) {
    let char = piecePlacement[i];

    if (char === "/") {
      rankNum--;
      fileNum = 1;
      continue;
    }

    const skips = parseInt(char);
    if (!isNaN(skips)) {
      fileNum += skips;
      continue;
    }
    let color = char === char.toUpperCase() ? WHITE : BLACK;
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
      default:
        throw new FENProcessingError("FEN character is incorrect: " + char);
    }
    setPiece(makePos(rankNum, fileNum), (color | type) as Piece, board);
    fileNum++;
  }

  return board;
}

/**
 * Advances the turn on the board by changing the color of the pieces to move.
 */
export function nextTurn(board: Board) {
  if (board.toMove === WHITE) {
    board.toMove = BLACK;
  } else {
    board.toMove = WHITE;
  }
}

// PRIVATE FUNCTION DEFINITIONS

/**
 * Returns the index into a board's mailbox from the given position.
 */
function getIndex(pos: Pos): number {
  return (getRankNumber(pos) - 1) * 8 + (getFileNumber(pos) - 1);
}
