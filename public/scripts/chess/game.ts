import { GameStateError } from "../errors.js";
import {
    Board,
  changeToMove,
  createBoard,
  getPiece,
  isInvalidPos,
  setPiece,
} from "./board.js";
import { getMovesForPiece, Move, Pos } from "./moves.js";
import { getColor, isPiece } from "./piece.js";

/**
 * Repersents a point on the window.
 */
export interface Point {
    x: number,
    y: number
}

/**
 * Repersents the hand of the human chess player.
 */
export interface Hand {
    piece: number,
    homePos: Pos | null,
    hoverPoint: Point | null
}

/**
 * Repersents the chess game.
 */
export class Game {
  board: Board;
  hand: Hand;
  possibleMoves: Move[];

  constructor() {
    this.board = createBoard();
    this.hand = { piece: 0, homePos: null, hoverPoint: null };
    this.possibleMoves = [];
    // more to come
  }

  /**
   * Returns true if a piece is being held from the board.
   * @returns { boolean }
   */
  isHoldingPiece() {
    return this.hand.piece != 0;
  }

  /**
   * Drops the held piece at the given position if it is legal
   * otherwise, returns the held piece to its original square
   * @param { Pos } pos
   */
  dropPiece(pos) {
    if (!this.isHoldingPiece) {
      throw new GameStateError("Cannot drop a piece without holding one.");
    }

    // does the possible moves contain the position?
    const hasPossibleMove = this.possibleMoves.filter(
      (move) => move.end.row === pos.row && move.end.col === pos.col
    );

    if (isInvalidPos(pos) || hasPossibleMove.length == 0) {
      // return piece to orginal square
      setPiece(this.hand.homePos as Pos, this.hand.piece, this.board);
      this.hand = { piece: 0, homePos: null, hoverPoint: null };
      return;
    }

    // move piece to valid move
    setPiece(pos, this.hand.piece, this.board);
    this.hand = { piece: 0, homePos: null, hoverPoint: null };

    this.possibleMoves = [];
    changeToMove(this.board);
  }
  /**
   * Returns true if a piece can be picked up from the give pos.
   * @param { Pos } pos
   * @returns { boolean }
   */
  canPickupPiece(pos) {
    if (isInvalidPos(pos)) return false;

    const piece = getPiece(pos, this.board);

    if (!isPiece(piece)) return false;

    if (getColor(piece) != this.board.toMove) return false;

    return true;
  }

  /**
   * Pickup the piece at the given pos
   * @param { Pos } pos
   */
  pickupPiece(pos) {
    if (!this.canPickupPiece(pos)) {
      throw new GameStateError("Cannot pickup the piece at " + pos);
    }
    const piece = getPiece(pos, this.board);
    this.hand.piece = piece;
    setPiece(pos, 0, this.board);
    this.hand.homePos = pos;
  }

  /**
   * Sets the hover point of the held piece
   * throws PieceMovementError if !isHoldingPiece().
   * @param { Point } point
   */
  hoverHoldingPiece(point) {
    if (!this.isHoldingPiece()) {
      throw new GameStateError("Cannot hover when their is not a held piece.");
    }
    this.hand.hoverPoint = point;
  }

  /**
   * Sets the players possible moves to the ones from the given pos.
   * @param { Pos } pos
   */
  setPossibleMoves(pos) {
    this.possibleMoves = getMovesForPiece(pos, this.board);
  }

  /**
   * Clears the players possible moves.
   */
  clearPossibleMoves() {
    this.possibleMoves = [];
  }
}
