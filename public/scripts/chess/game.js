import { GameStateError } from "../errors.js";
import {
  changeToMove,
  createBoard,
  getPiece,
  isInvalidPos,
  setPiece,
} from "./board.js";
import { getMovesForPiece } from "./moves.js";
import { getColor, isPiece } from "./piece.js";

/**
 * Repersents the chess game.
 */
export class Game {
  constructor() {
    this.board = createBoard();
    this.heldSlot = { piece: 0, homePos: null, hoverPoint: null };
    this.possibleMoves = [];
    // more to come
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
      setPiece(this.heldSlot.homePos, this.heldSlot.piece, this.board);
      this.heldSlot = { piece: 0, homePos: null, hoverPoint: null };
      return;
    }

    // move piece to valid move
    setPiece(pos, this.heldSlot.piece, this.board);
    this.heldSlot = { piece: 0, homePos: null, hoverPoint: null };

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
    this.heldSlot.piece = piece;
    setPiece(pos, 0, this.board);
    this.heldSlot.homePos = pos;
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
    this.heldSlot.hoverPoint = point;
  }

  /**
   * Sets the players possible moves to the ones from the given pos.
   * @param { Pos } pos
   */
  setPossibleMoves(pos) {
    this.possibleMoves = getMovesForPiece(pos, this.board);
    console.log(this.possibleMoves);
  }

  /**
   * Clears the players possible moves.
   */
  clearPossibleMoves() {
    this.possibleMoves = [];
  }
}
