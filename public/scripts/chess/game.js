import { FENProcessingError, PieceMovementError } from "../errors.js";
import { getMoves, isInvalidPos } from "./move.js";
import {
  BISHOP,
  BLACK,
  KING,
  KNIGHT,
  PAWN,
  QUEEN,
  ROOK,
  WHITE,
  isPiece,
} from "./piece.js";

const GameState = {
  WAITING_FOR_PLAYER: 1,
  WAITING_FOR_BOT: 2,
};

/**
 * Repersents the chess game.
 */
export class Game {
  constructor() {
    this.board = Array.from({ length: 8 }, () => new Array(8).fill(0));
    this.heldSlot = { piece: 0, homePos: null, hoverPoint: null };
    this.possibleMoves = [];
    this.turn = "white";
    this.state = GameState.WAITING_FOR_PLAYER;
    this.loadFromFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");
    // more to come
  }

  /**
   *
   * @param { string } fen
   */
  loadFromFEN(fen) {
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
      this.board[row][col] = color | type;
      col++;
    }
  }

  /**
   * Returns true if a piece is being held from the board.
   * @returns { boolean }
   */
  isHoldingPiece() {
    return this.heldSlot.piece != 0;
  }

  /**
   * Drops the held piece at the given position if it is legal
   * otherwise, returns the held piece to its original square
   * throws PieceMovementError if !isHoldingPiece().
   * @param { Pos } pos
   */
  dropPiece(pos) {
    if (!this.isHoldingPiece) {
      throw new PieceMovementError("Cannot drop a piece without holding one.");
    }

    // does the possible moves contain the position?
    const hasPossibleMove = this.possibleMoves.filter(
      (move) => move.row === pos.row && move.col === pos.col
    );

    if (isInvalidPos(pos) || hasPossibleMove.length == 0) {
      // return piece to orginal square
      this.board[this.heldSlot.homePos.row][this.heldSlot.homePos.col] =
        this.heldSlot.piece;
      this.heldSlot = { piece: 0, homePos: null, hoverPoint: null };
      return;
    }

    // move piece to valid move
    this.board[pos.row][pos.col] = this.heldSlot.piece;
    this.heldSlot = { piece: 0, homePos: null, hoverPoint: null };

    this.possibleMoves = [];
  }

  /**
   * Returns true if a piece can be picked up from the give pos.
   * @param { Pos } pos
   * @returns { boolean }
   */
  canPickupPiece(pos) {
    if (isInvalidPos(pos)) return false;

    const piece = this.board[pos.row][pos.col];

    if (!isPiece(piece)) return false;

    return true;
  }

  /**
   * Pickup the piece at the given pos
   * throws PieceMovementError if !canPickup(pos).
   * @param { Pos } pos
   */
  pickupPiece(pos) {
    if (!this.canPickupPiece(pos)) {
      throw new PieceMovementError("Cannot pickup the piece at " + pos);
    }
    const piece = this.board[pos.row][pos.col];
    this.heldSlot.piece = piece;
    this.board[pos.row][pos.col] = 0;
    this.heldSlot.homePos = pos;
  }

  /**
   * Sets the hover point of the held piece
   * throws PieceMovementError if !isHoldingPiece().
   * @param { Point } point
   */
  hoverHoldingPiece(point) {
    if (!this.isHoldingPiece()) {
      throw new PieceMovementError(
        "Cannot hover when their is not a held piece."
      );
    }
    this.heldSlot.hoverPoint = point;
  }

  /**
   * Sets the players possible moves to the ones from the given pos.
   * @param { Pos } pos
   */
  setPossibleMoves(pos) {
    this.possibleMoves = getMoves(pos, this.board);
  }

  /**
   * Clears the players possible moves.
   */
  clearPossibleMoves() {
    this.possibleMoves = [];
  }
}
