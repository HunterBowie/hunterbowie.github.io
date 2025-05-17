import { DEBUG } from "../constants.js";
import { GameStateError, MoveError } from "../errors.js";
import { Logger } from "../logger.js";
import { getFileNumber, getPiece, getRankNumber, loadBoardFromFEN, makePos, nextTurn, setPiece, shiftPos, } from "./board/core.js";
import { assertBoardInvariant } from "./board/invariant.js";
import { removeAllCastlingRights, removeKingsideCastlingRights, removeQueensideCastlingRights, } from "./board/moves/castling.js";
import { getMoves, SpecialMove } from "./board/moves/core.js";
import { EMPTY_PIECE, getColor, getType, KING, WHITE, } from "./board/piece.js";
/**
 * Repersents the chess game.
 * The chess game is the point of contact for both the engine and input
 * to control aspects of the chess game such as moving pieces.
 */
export class Game {
    board;
    selected;
    held;
    debugSquares;
    constructor() {
        this.board = loadBoardFromFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
        this.selected = null;
        this.held = null;
        this.debugSquares = []; // used for highlighting chess squares for visual debug
        this.assertInvariant();
    }
    /**
     * Returns true if a piece is selected.
     */
    hasSelectedPiece() {
        return this.selected != null;
    }
    /**
     * Returns true if a piece is held.
     */
    isHoldingPiece() {
        return this.held != null;
    }
    /**
     * Returns the list of possible moves for the currently selected piece.
     * Requires hasSelectedPiece().
     */
    getMovesForSelectedPiece() {
        return this.selected.moves;
    }
    /**
     * Returns the list of possible moves for the currently held piece.
     * Requires isHoldingPiece().
     */
    getMovesForHeldPiece() {
        return this.held.moves;
    }
    /**
     * Plays the given move on the board and advances the turn.
     * Requires the move to be legal and valid.
     */
    playMove(move) {
        this.board.enPassant = null;
        const piece = getPiece(move.start, this.board);
        setPiece(move.start, 0, this.board);
        setPiece(move.end, piece, this.board);
        if (move.special !== undefined) {
            Logger.log(Logger.GAME, `Making a ${SpecialMove[move.special]} move`);
            switch (move.special) {
                // TODO: fill in the special move effects
                case SpecialMove.CASTLE_KINGSIDE:
                    Logger.log(Logger.CASTLING, "Castling Kingside");
                    const rookPos = shiftPos(move.end, 0, 1);
                    const rook = getPiece(rookPos, this.board);
                    setPiece(rookPos, 0, this.board);
                    setPiece(shiftPos(move.end, 0, -1), rook, this.board);
                    break;
                case SpecialMove.CASTLE_QUEENSIDE:
                    break;
                case SpecialMove.EN_PASSANT:
                    Logger.log(Logger.GAME, `En Passant at ${move.end}`);
                    const direction = this.board.toMove === WHITE ? 1 : -1;
                    const removePieceAt = shiftPos(move.end, -direction, 0);
                    setPiece(removePieceAt, 0, this.board);
                    break;
                case SpecialMove.PROMOTION:
                    break;
                case SpecialMove.OPEN_TO_EN_PASSANT:
                    this.board.enPassant = this.#calcEnPassantSquare(move.start, move.end);
                    break;
                case SpecialMove.COULD_BREAK_CASTLE_RIGHTS:
                    Logger.log(Logger.CASTLING, `This move is breaking some castling rights`);
                    if (getType(piece) === KING) {
                        removeAllCastlingRights(this.board);
                    }
                    else {
                        // queenside rook
                        if (getFileNumber(move.start) === 1) {
                            removeQueensideCastlingRights(this.board);
                        }
                        else {
                            removeKingsideCastlingRights(this.board);
                            // kingside rook
                        }
                    }
                    Logger.log(Logger.CASTLING, `current castling rights are whiteKingside: ${this.board.whiteCastleRightsKingside},
             whiteQueenside: ${this.board.whiteCastleRightsQueenside}`);
                    break;
                default:
                    throw new MoveError("The following special move has no defined behaviour: " +
                        move.special);
            }
        }
        nextTurn(this.board);
    }
    /**
     * Returns the En Passant square given the start and end positions of
     * the pawn double push move.
     * Requires getFileNumber(pos1) === getFileNumber(pos2)
     * and |getRankNumber(pos1) - getRankNumber(pos1)| === 2
     */
    #calcEnPassantSquare(pos1, pos2) {
        const firstRankNumber = getRankNumber(pos1);
        const secondRankNumber = getRankNumber(pos2);
        const resultRank = (firstRankNumber + secondRankNumber) / 2;
        return makePos(resultRank, getFileNumber(pos1));
    }
    /**
     * Unselects the current piece if there is a selected piece.
     */
    unselectPiece() {
        this.selected = null;
        this.assertInvariant();
    }
    /**
     * Moves the held piece back to its original position.
     * This removes the held piece.
     * Requires isHoldingPiece().
     */
    returnHeldPiece() {
        setPiece(this.held.home, this.held.piece, this.board);
        this.held = null;
        this.assertInvariant();
    }
    /**
     * Selects the piece with the given pos.
     * Requires canPickPiece(pos).
     */
    selectPiece(pos) {
        this.selected = { pos: pos, moves: getMoves(pos, this.board) };
        this.assertInvariant();
    }
    /**
     * Returns true if a piece can be picked.
     * "Picking" a piece means to select or hold it for play.
     */
    canPickPiece(pos) {
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
     * Requires canPickPiece(pos).
     */
    pickupPiece(pos, hover) {
        Logger.log(Logger.CASTLING, `Picking up piece`);
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
     * Requires isHoldingPiece().
     */
    hoverHoldingPiece(point) {
        this.held.hover = point;
        this.assertInvariant();
    }
    /**
     * Checks if the game has invalid state when debug mode is enabled.
     * Throws a GameStateError if the game has invalid state.
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
