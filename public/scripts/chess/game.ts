import { GameStateError } from "../errors.js";
import {
  Board,
  changeToMove,
  createStartingBoard,
  getPiece,
  isInvalidPos,
  setPiece,
} from "./board.js";
import { getMovesForPiece, Move, Pos } from "./moves.js";
import { getColor, isPiece, Piece } from "./piece.js";

/**
 * Repersents a point on the window.
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Repersents the hand of the human chess player.
 */
export interface Hand {
  piece: Piece;
  homePos: Pos | null;
  hoverPoint: Point | null;
}

/**
 * Repersents when a chess piece is picked up by the user.
 */
export interface Held {
  piece: Piece;
  home: Pos;
  moves: Move[];
  hover: Point | null;
}

/**
 * Repersents when a chess piece is selected by the user.
 */
export interface Selected {
  pos: Pos;
  moves: Move[];
}

/**
 * Repersents the chess game.
 * The chess game is the point of contact for both the engine and input
 * to control aspects of the chess game such as moveing pieces.
 */
export class Game {
    board: Board;
    
    selected: Selected | null;
    held: Held | null;
    
    
    constructor() {
        this.board = createStartingBoard();
        
        this.selected = null;
        this.held = null;
    }
    
    /**
     * Returns true if a piece is selected.
     */
    hasSelectedPiece(): boolean {
        return this.selected != null;
    }
    
    /**
     * Selects the piece with the given pos.
     */
    selectPiece(pos: Pos) {
        this.selected = {pos: pos, moves: getMovesForPiece(pos, this.board)}
    }
    /**
     * Returns true if a piece is being held from the board.
    */
   isHoldingPiece(): boolean {
       return this.held != null;
  }

  /**
   * Unselects the current piece if one is selected.
   */
  clearSelectedPiece() {
    this.selected = null;
  }

  /**
   * Returns true if the currently selected piece can move to the given position.
   * Throws GameStateError !hasSelectedPiece().
   */
  canMoveSelectedPiece(pos: Pos): boolean {
    if (!this.hasSelectedPiece()) {
      throw new GameStateError(
        "Cannot check selected piece movement with selected piece"
      );
    }

    // cleanup: must combine with duplicate later
    const hasPossibleMove = this.selected.moves.filter(
      (move) => move.end.row === pos.row && move.end.col === pos.col
    );

    if (hasPossibleMove.length != 0) {
      return true;
    }

    return false;
  }

  /**
   * Moves the selected piece to the given position.
   * Throws GameStateError !canMoveSelectedPiece().
   */
  moveSelectedPiece(pos: Pos) {
    if (!this.canMoveSelectedPiece(pos)) {
      throw new GameStateError("Cannot move selected piece");
    }

    const piece = getPiece(this.selected.pos, this.board);
    setPiece(this.selected.pos, 0, this.board);
    setPiece(pos, piece, this.board);
    this.selected = null;
    changeToMove(this.board);
  }

  /**
   * Drops the held piece at the given position if it is legal
   * otherwise, returns the held piece to its original square.
   * Throws GameStateError if !this.isHoldingPiece().
   */
  dropPiece(pos: Pos) {
    if (!this.isHoldingPiece()) {
      throw new GameStateError("Cannot drop a piece without holding one");
    }

    // does the possible moves contain the position?
    const hasPossibleMove = this.held.moves.filter(
      (move) => move.end.row === pos.row && move.end.col === pos.col
    );

    if (isInvalidPos(pos) || hasPossibleMove.length == 0) {
      // return piece to orginal square
      setPiece(this.held.home, this.held.piece, this.board);
      this.selected = { pos: this.held.home, moves: this.held.moves };
      this.held = null;
      return;
    }

    // move piece to valid move
    setPiece(pos, this.held.piece, this.board);
    this.held = null;

    changeToMove(this.board);
  }
  /**
   * Returns true if a piece can be picked up from the give pos.
   */
  canPickupPiece(pos: Pos): boolean {
    if (isInvalidPos(pos)) return false;

    const piece = getPiece(pos, this.board);

    if (!isPiece(piece)) return false;

    if (getColor(piece) != this.board.toMove) return false;

    return true;
  }

  /**
   * Pickup the piece at the given pos.
   */
  pickupPiece(pos: Pos, hover: Point) {
    if (!this.canPickupPiece(pos)) {
      throw new GameStateError("Cannot pickup the piece at " + pos);
    }
    const piece = getPiece(pos, this.board);
    this.held = {
      piece: piece,
      home: pos,
      hover: hover,
      moves: getMovesForPiece(pos, this.board),
    };
    setPiece(pos, 0, this.board);
  }

  /**
   * Sets the hover point of the held piece.
   * Throws PieceMovementError if !isHoldingPiece().
   */
  hoverHoldingPiece(point: Point) {
    if (!this.isHoldingPiece()) {
      throw new GameStateError("Cannot hover when their is not a held piece.");
    }
    this.held.hover = point;
  }
}
