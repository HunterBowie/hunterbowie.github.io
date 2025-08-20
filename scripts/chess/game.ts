import { DEBUG, STARTING_FEN } from "../constants.js";
import { GameStateError, MoveError } from "../errors.js";
import { Logger } from "../logger.js";
import {
  Board,
  getFileNumber,
  getPiece,
  getRankNumber,
  loadBoardFromFEN,
  makePos,
  nextTurn,
  Pos,
  setPiece,
  shiftPos,
} from "./board/core.js";
import { assertBoardInvariant } from "./board/invariant.js";
import {
  removeAllCastlingRights,
  removeKingsideCastlingRights,
  removeQueensideCastlingRights,
} from "./board/moves/castling.js";
import {
  BreaksCastlingRightsFlag,
  CastleKingsideFlag,
  CastleQueensideFlag,
  EnPassantFlag,
  getMoves,
  isKingInCheck,
  Move,
  NoFlag,
  noMovesPlayable,
  PawnDoublePushFlag,
  PromoteToQueenFlag,
} from "./board/moves/core.js";
import {
  BLACK,
  EMPTY_PIECE,
  getColor,
  getType,
  isWhite,
  KING,
  PAWN,
  Piece,
  PieceColor,
  PieceType,
  QUEEN,
  WHITE,
} from "./board/piece.js";
import { copyBoard } from "./board/utils.js";

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

export enum PlayerType {
  BOT,
  HUMAN,
}

/**
 * Repersents the chess game.
 * The chess game is the point of contact for both the engine and input
 * to control aspects of the chess game such as moving pieces.
 */
export class Game {
  board: Board;
  selected: Selected | null;
  held: Held | null;
  lastMoveStart: Pos | null;
  lastMoveEnd: Pos | null;
  promotionPiece: Piece = QUEEN;
  playerTypeWhite: PlayerType;
  playerTypeBlack: PlayerType;
  callWhenBotToMove: () => void;
  previousBoardState: Board;
  previousLastMoveStart: Pos | null;
  previousLastMoveEnd: Pos | null;

  constructor(whiteType: PlayerType, blackType: PlayerType) {
    this.playerTypeWhite = whiteType;
    this.playerTypeBlack = blackType;
    this.callWhenBotToMove = () => {};
    this.newGame();
  }

  /**
   * Sets up a function that will be called when the bot player starts its turn.
   */
  onBotToMove(func: () => void) {
    this.callWhenBotToMove = func;
  }

  /**
   * Returns true if the human player is next to move.
   */
  isHumanPlayerToMove(): boolean {
    const typeToMove =
      this.board.toMove === WHITE ? this.playerTypeWhite : this.playerTypeBlack;
    return typeToMove === PlayerType.HUMAN;
  }

  /**
   * Returns true if the bot player is next to move.
   */
  isBotPlayerToMove(): boolean {
    const typeToMove =
      this.board.toMove === WHITE ? this.playerTypeWhite : this.playerTypeBlack;
    return typeToMove === PlayerType.BOT;
  }

  /**
   * Returns true if a piece is selected.
   */
  hasSelectedPiece(): boolean {
    return this.selected != null;
  }

  /**
   * Returns true if a piece is held.
   */
  isHoldingPiece(): boolean {
    return this.held != null;
  }

  /**
   * Returns the list of possible moves for the currently selected piece.
   * Requires hasSelectedPiece().
   */
  getMovesForSelectedPiece(): Move[] {
    return this.selected.moves;
  }

  /**
   * Returns the list of possible moves for the currently held piece.
   * Requires isHoldingPiece().
   */
  getMovesForHeldPiece(): Move[] {
    return this.held.moves;
  }

  /**
   * Sets the promotion piece type of the next promotion event.
   * Throws RangeError if pieceType === KING
   * Throws RangeError if pieceType === PAWN
   */
  nextPiecePromotesTo(pieceType: PieceType) {
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
  isPromotionMove(move: Move): boolean {
    if (getType(getPiece(move.start, this.board)) !== PAWN) return false;

    if ([1, 8].includes(getRankNumber(move.end))) return true;

    return false;
  }

  /**
   * Undoes the previous move by returning the board
   * to its previous state.
   */
  undoMove() {
    if (this.isHoldingPiece()) {
      return;
    }
    this.lastMoveStart = this.previousLastMoveStart;
    this.lastMoveEnd = this.previousLastMoveEnd;
    this.board = this.previousBoardState;
  }

  /**
   * Plays the given move on the board and advances the turn.
   * Requires the move to be legal and valid.
   */
  playMove(move: Move) {
    if (this.board.toMove == BLACK) {
      this.board.numFullMoves += 1;
    }

    const oldBoard = copyBoard(this.board);

    this.board.enPassant = null;
    let pawnOrCapture = false;

    const piece = getPiece(move.start, this.board);
    const endPiece = getPiece(move.end, this.board);

    if (getType(piece) == PAWN || endPiece != EMPTY_PIECE) {
      pawnOrCapture = true;
    }

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
          setPiece(
            move.end,
            (this.promotionPiece | getColor(piece)) as Piece,
            this.board
          );
          this.promotionPiece = QUEEN; // default promotion type
          break;
        case PawnDoublePushFlag:
          this.board.enPassant = this.#calcEnPassantSquare(
            move.start,
            move.end
          );
          break;
        case BreaksCastlingRightsFlag:
          Logger.log(
            Logger.CASTLING,
            `This move is breaking some castling rights`
          );
          if (getType(piece) === KING) {
            removeAllCastlingRights(this.board);
          } else {
            // queenside rook
            if (getFileNumber(move.start) === 1) {
              removeQueensideCastlingRights(this.board);
            } else {
              removeKingsideCastlingRights(this.board);
              // kingside rook
            }
          }
          Logger.log(
            Logger.CASTLING,
            `current castling rights are whiteKingside: ${this.board.whiteCastleRightsKingside},
             whiteQueenside: ${this.board.whiteCastleRightsQueenside}`
          );
          break;
        default:
          throw new MoveError(
            "The following special move has no defined behaviour: " + move.flag
          );
      }
    }
    nextTurn(this.board);

    if (!pawnOrCapture) {
      this.board.numHalfMoves += 1;
    } else {
      this.board.numHalfMoves = 0;
    }

    const playerTypeToMove =
      this.board.toMove === WHITE ? this.playerTypeWhite : this.playerTypeBlack;
    if (playerTypeToMove === PlayerType.BOT) {
      this.previousBoardState = copyBoard(oldBoard);
      this.previousLastMoveStart = this.lastMoveStart;
      this.previousLastMoveEnd = this.lastMoveEnd;
      this.callWhenBotToMove();
      this.lastMoveStart = null;
      this.lastMoveEnd = null;
    } else {
      this.lastMoveStart = move.start;
      this.lastMoveEnd = move.end;
    }
  }

  /**
   * Restarts the game by setting the board back to starting postition.
   */
  newGame() {
    this.board = loadBoardFromFEN(STARTING_FEN);
    this.previousBoardState = copyBoard(this.board);
    this.previousLastMoveStart = null;
    this.previousLastMoveEnd = null;
    this.selected = null;
    this.held = null;
    this.lastMoveStart = null;
    this.lastMoveEnd = null;
    this.assertInvariant();
    if (this.playerTypeWhite == PlayerType.BOT) {
      this.callWhenBotToMove();
    }
  }

  /**
   * Returns true if the white player is a bot.
   */
  isFlipped(): boolean {
    return this.playerTypeWhite == PlayerType.BOT;
  }

  /**
   * Returns true if the game is tied or won.
   */
  isOver(): boolean {
    if (this.isHoldingPiece()) return false;
    // TODO: FINISH IMPLEMENTATION
    if (this.isCheckmate() !== null) return true;
    if (this.isStalemate()) return true;
    // three fold repetition ... insufficient material
    return false;
  }

  /**
   * Returns the color that won via checkmate.
   * If no color has won via checkmate or there is a tie, returns null.
   */
  isCheckmate(): PieceColor | null {
    if (noMovesPlayable(this.board) && !isKingInCheck(this.board)) {
      return isWhite(this.board.toMove) ? BLACK : WHITE;
    }
    return null;
  }

  /**
   * Returns true if game has tied because of a stalemate.
   */
  isStalemate(): boolean {
    return noMovesPlayable(this.board) && isKingInCheck(this.board);
  }

  /**
   * Returns the En Passant square given the start and end positions of
   * the pawn double push move.
   * Requires getFileNumber(pos1) === getFileNumber(pos2)
   * and |getRankNumber(pos1) - getRankNumber(pos1)| === 2
   */
  #calcEnPassantSquare(pos1: Pos, pos2: Pos): Pos {
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
  selectPiece(pos: Pos) {
    this.selected = { pos: pos, moves: getMoves(pos, this.board) };
    this.assertInvariant();
  }

  /**
   * Returns true if a piece can be picked.
   * "Picking" a piece means to select or hold it for play.
   */
  canPickPiece(pos: Pos): boolean {
    const piece = getPiece(pos, this.board);

    if (piece === EMPTY_PIECE) return false;

    if (getColor(piece) != this.board.toMove) return false;

    this.assertInvariant();

    return true;
  }

  /**
   * Pickup the piece at the given pos.
   * Requires canPickPiece(pos).
   */
  pickupPiece(pos: Pos, hover: Point) {
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
  hoverHoldingPiece(point: Point) {
    this.held.hover = point;
    this.assertInvariant();
  }

  /**
   * Checks if the game has invalid state when debug mode is enabled.
   * Throws a GameStateError if the game has invalid state.
   */
  assertInvariant() {
    if (!DEBUG) return;

    if (!this.isHoldingPiece()) {
      assertBoardInvariant(this.board);
    }

    if (this.selected != null && this.held != null) {
      throw new GameStateError("The game has both a selected and held piece");
    }

    if (
      this.playerTypeWhite === PlayerType.BOT &&
      this.playerTypeBlack === PlayerType.BOT
    ) {
      throw new GameStateError("Bot vs. Bot is not a legitimate game (yet)");
    }
  }
}
