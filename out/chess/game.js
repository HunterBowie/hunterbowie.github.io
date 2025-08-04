import { DEBUG, STARTING_FEN } from "../constants.js";
import { GameStateError, MoveError } from "../errors.js";
import { Logger } from "../logger.js";
import { getFileNumber, getPiece, getRankNumber, loadBoardFromFEN, makePos, nextTurn, setPiece, shiftPos, } from "./board/core.js";
import { assertBoardInvariant } from "./board/invariant.js";
import { removeAllCastlingRights, removeKingsideCastlingRights, removeQueensideCastlingRights, } from "./board/moves/castling.js";
import { BreaksCastlingRightsFlag, CastleKingsideFlag, CastleQueensideFlag, EnPassantFlag, getMoves, isKingInCheck, NoFlag, noMovesPlayable, PawnDoublePushFlag, PromoteToQueenFlag, } from "./board/moves/core.js";
import { BLACK, EMPTY_PIECE, getColor, getType, isWhite, KING, PAWN, QUEEN, WHITE, } from "./board/piece.js";
export var PlayerType;
(function (PlayerType) {
    PlayerType[PlayerType["BOT"] = 0] = "BOT";
    PlayerType[PlayerType["HUMAN"] = 1] = "HUMAN";
})(PlayerType || (PlayerType = {}));
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
    lastMoveStart;
    lastMoveEnd;
    promotionPiece = QUEEN;
    playerTypeWhite;
    playerTypeBlack;
    callWhenBotToMove;
    constructor(whiteType, blackType) {
        this.playerTypeWhite = whiteType;
        this.playerTypeBlack = blackType;
        this.board = loadBoardFromFEN(STARTING_FEN);
        this.selected = null;
        this.held = null;
        this.lastMoveStart = null;
        this.lastMoveEnd = null;
        this.debugSquares = []; // used for highlighting chess squares for visual debug
        this.callWhenBotToMove = () => { };
        this.assertInvariant();
        // MUST MOVE TO A START() function called in main after bot setup
        // if (this.playerTypeWhite === PlayerType.BOT) {
        //   this.callWhenBotToMove();
        // }
    }
    /**
     * Sets up a function that will be called when the bot player starts its turn.
     */
    onBotToMove(func) {
        this.callWhenBotToMove = func;
    }
    /**
     * Returns true if the human player is next to move.
     */
    isHumanPlayerToMove() {
        const typeToMove = this.board.toMove === WHITE ? this.playerTypeWhite : this.playerTypeBlack;
        return typeToMove === PlayerType.HUMAN;
    }
    /**
     * Returns true if the bot player is next to move.
     */
    isBotPlayerToMove() {
        const typeToMove = this.board.toMove === WHITE ? this.playerTypeWhite : this.playerTypeBlack;
        return typeToMove === PlayerType.BOT;
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
     * Sets the promotion piece type of the next promotion event.
     * Throws RangeError if pieceType === KING
     * Throws RangeError if pieceType === PAWN
     */
    nextPiecePromotesTo(pieceType) {
        if (pieceType === KING) {
            throw new RangeError("You cannot promote to a king");
        }
        if (pieceType === PAWN) {
            throw new RangeError("You cannot promote to a pawn");
        }
        this.promotionPiece = pieceType;
    }
    /**
     * Returns true if the given move will result in a promotion in this game.
     */
    isPromotionMove(move) {
        if (getType(getPiece(move.start, this.board)) !== PAWN)
            return false;
        if ([1, 8].includes(getRankNumber(move.end)))
            return true;
        return false;
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
        if (move.flag !== NoFlag) {
            Logger.log(Logger.GAME, `Making a ${move.flag} move`);
            switch (move.flag) {
                case CastleKingsideFlag:
                    Logger.log(Logger.CASTLING, "Castling Kingside");
                    const rookPosKingside = shiftPos(move.end, 0, 1);
                    const rookKingside = getPiece(rookPosKingside, this.board);
                    setPiece(rookPosKingside, 0, this.board);
                    setPiece(shiftPos(move.end, 0, -1), rookKingside, this.board);
                    break;
                case CastleQueensideFlag:
                    Logger.log(Logger.CASTLING, "Castling Queenside");
                    const rookPosQueenside = shiftPos(move.end, 0, -2);
                    const rookQueenside = getPiece(rookPosQueenside, this.board);
                    setPiece(rookPosQueenside, 0, this.board);
                    setPiece(shiftPos(move.end, 0, 1), rookQueenside, this.board);
                    break;
                case EnPassantFlag:
                    Logger.log(Logger.GAME, `En Passant at ${move.end}`);
                    const direction = this.board.toMove === WHITE ? 1 : -1;
                    const removePieceAt = shiftPos(move.end, -direction, 0);
                    setPiece(removePieceAt, 0, this.board);
                    break;
                case PromoteToQueenFlag:
                    setPiece(move.end, (this.promotionPiece | getColor(piece)), this.board);
                    this.promotionPiece = QUEEN; // default promotion type
                    break;
                case PawnDoublePushFlag:
                    this.board.enPassant = this.#calcEnPassantSquare(move.start, move.end);
                    break;
                case BreaksCastlingRightsFlag:
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
                    throw new MoveError("The following special move has no defined behaviour: " + move.flag);
            }
        }
        nextTurn(this.board);
        const playerTypeToMove = this.board.toMove === WHITE ? this.playerTypeWhite : this.playerTypeBlack;
        if (playerTypeToMove === PlayerType.BOT) {
            this.callWhenBotToMove();
            this.lastMoveStart = null;
            this.lastMoveEnd = null;
        }
        else {
            this.lastMoveStart = move.start;
            this.lastMoveEnd = move.end;
        }
    }
    /**
     * Returns true if the game is tied or won.
     */
    isOver() {
        if (this.isHoldingPiece())
            return false;
        // TODO: FINISH IMPLEMENTATION
        if (this.isCheckmate() !== null)
            return true;
        if (this.isStalemate())
            return true;
        // three fold repetition ... insufficient material
        return false;
    }
    /**
     * Returns the color that won via checkmate.
     * If no color has won via checkmate or there is a tie, returns null.
     */
    isCheckmate() {
        if (noMovesPlayable(this.board) && !isKingInCheck(this.board)) {
            return isWhite(this.board.toMove) ? BLACK : WHITE;
        }
        return null;
    }
    /**
     * Returns true if game has tied because of a stalemate.
     */
    isStalemate() {
        return noMovesPlayable(this.board) && isKingInCheck(this.board);
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
        if (this.playerTypeWhite === PlayerType.BOT &&
            this.playerTypeBlack === PlayerType.BOT) {
            throw new GameStateError("Bot vs. Bot is not a legitimate game (yet)");
        }
    }
}
