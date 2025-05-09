import { DEBUG } from "../constants.js";
import { GameStateError } from "../errors.js";
import { Logger } from "../logger.js";
import { getPiece, loadBoardFromFEN, nextTurn, setPiece, } from "./board/core.js";
import { assertBoardInvariant } from "./board/invariant.js";
import { getMoves } from "./board/moves/legal.js";
import { EMPTY_PIECE, getColor } from "./board/piece.js";
/**
 * Repersents the chess game.
 * The chess game is the point of contact for both the engine and input
 * to control aspects of the chess game such as moveing pieces.
 */
export class Game {
    board;
    selected;
    held;
    constructor() {
        this.board = loadBoardFromFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
        this.selected = null;
        this.held = null;
        this.assertInvariant();
    }
    /**
     * Returns true if a piece is selected.
     */
    hasSelectedPiece() {
        return this.selected != null;
    }
    /**
     * Returns true if a piece is being held from the board.
     */
    isHoldingPiece() {
        return this.held != null;
    }
    /**
     * Clears the held piece and returns it to its home position if there is a held piece.
     */
    returnPickedPiece() {
        if (this.isHoldingPiece()) {
            setPiece(this.held.home, this.held.piece, this.board);
            this.selected = { pos: this.held.home, moves: this.held.moves };
            this.held = null;
        }
        this.assertInvariant();
    }
    /**
     * Selects the piece with the given pos.
     */
    selectPiece(pos) {
        this.selected = { pos: pos, moves: getMoves(pos, this.board) };
        this.assertInvariant();
    }
    /**
     * Unselects the current piece if one is selected.
     */
    clearSelectedPiece() {
        this.selected = null;
        this.assertInvariant();
    }
    /**
     * Returns true if the currently selected piece can move to the given position.
     */
    canMoveSelectedPiece(pos) {
        // cleanup: must combine with duplicate later
        const hasPossibleMove = this.selected.moves.filter((move) => move.end === pos);
        if (hasPossibleMove.length != 0) {
            return true;
        }
        this.assertInvariant();
        return false;
    }
    /**
     * Moves the selected piece to the given position.
     * Throws GameStateError !canMoveSelectedPiece().
     */
    moveSelectedPiece(pos) {
        const piece = getPiece(this.selected.pos, this.board);
        setPiece(this.selected.pos, 0, this.board);
        setPiece(pos, piece, this.board);
        this.selected = null;
        nextTurn(this.board);
        this.assertInvariant();
    }
    /**
     * Drops the held piece at the given position if it is legal
     * otherwise, returns the held piece to its original square.
     */
    dropPiece(pos) {
        // does the possible moves contain the position?
        const hasPossibleMove = this.held.moves.filter((move) => move.end === pos);
        if (hasPossibleMove.length == 0) {
            // return piece to orginal square
            this.returnPickedPiece();
            return;
        }
        // move piece to valid move
        setPiece(pos, this.held.piece, this.board);
        this.held = null;
        nextTurn(this.board);
        this.assertInvariant();
    }
    /**
     * Returns true if a piece can be picked up from the give pos.
     */
    canPickupPiece(pos) {
        const piece = getPiece(pos, this.board);
        if (piece === EMPTY_PIECE)
            return false;
        if (getColor(piece) != this.board.toMove)
            return false;
        this.assertInvariant();
        return true;
    }
    /**
     * Pickup the piece at the given pos.
     */
    pickupPiece(pos, hover) {
        const piece = getPiece(pos, this.board);
        const moves = getMoves(pos, this.board);
        Logger.log(Logger.GAME, `Generating ${moves.length} moves`);
        this.held = {
            piece: piece,
            home: pos,
            hover: hover,
            moves: moves,
        };
        setPiece(pos, 0, this.board);
        this.assertInvariant();
    }
    /**
     * Sets the hover point of the held piece.
     * Throws PieceMovementError if !isHoldingPiece().
     */
    hoverHoldingPiece(point) {
        this.held.hover = point;
        this.assertInvariant();
    }
    /**
     * Checks if the game has invalid state when debug mode is enabled.
     * Throws a BoardStateError if the game has invalid state.
     */
    assertInvariant() {
        if (!DEBUG)
            return;
        if (!this.isHoldingPiece()) {
            assertBoardInvariant(this.board);
        }
        if (this.selected != null && this.held != null) {
            throw new GameStateError("The game has both a selected and held piece");
        }
    }
}
