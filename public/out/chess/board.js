import { BoardStateError, FENProcessingError, InvalidPosError } from "../errors.js";
import { BISHOP, BLACK, getColor, KING, KNIGHT, PAWN, QUEEN, ROOK, WHITE, } from "./piece.js";
import { DEBUG } from "../constants.js";
import { getRawMovesForPiece } from "./moves.js";
/**
 * Creates a standard board with no moves played.
 */
export function createStartingBoard() {
    let emptyBoard = {
        mailbox: new Array(64).fill(0),
        toMove: WHITE,
        whiteCastleRights: true,
        blackCastleRights: true,
        enPassant: null,
        numReversibleMoves: 0,
    };
    loadBoardPiecesFromFEN(emptyBoard, "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");
    return emptyBoard;
}
/**
 * Modifies the given board by adding the pieces specified in the FEN notation.
 * Throws FENProcessingError if the given fen is invalid.
 */
function loadBoardPiecesFromFEN(board, fen) {
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
        setPiece({ row: row, col: col }, (color | type), board);
        col++;
    }
}
/**
 * Returns a copy of the given board.
 */
export function copyBoard(board) {
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
export function isInvalidPos(pos) {
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
function findKing(board) {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
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
 * Returns true if the currently playing king is in check.
 * Throws BoardStateError if there is no king of that color on the board.
 */
export function isKingInCheck(board) {
    const kingsPos = findKing(board);
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
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
 * Throws InvalidPosError if the given position is invalid
 */
function calcIndex(pos) {
    if (isInvalidPos(pos)) {
        throw new InvalidPosError(pos);
    }
    return 8 * (7 - pos.row) + pos.col;
}
/**
 * Returns the piece on the board at the given position.
 * Throws InvalidPosError if the given position is invalid
 */
export function getPiece(pos, board) {
    return board.mailbox[calcIndex(pos)];
}
/**
 * Sets the piece on the board at the given position.
* Throws InvalidPosError if the given position is invalid
 */
export function setPiece(pos, piece, board) {
    board.mailbox[calcIndex(pos)] = piece;
}
/**
 * Changes the board's to move color.
 */
export function changeToMove(board) {
    if (board.toMove == WHITE) {
        board.toMove = BLACK;
    }
    else {
        board.toMove = WHITE;
    }
}
/**
 * Checks if the board has valid state if running in debug mode.
 * Throws BoardStateError if the board does not have valid state.
 */
export function assertBoardHasValidState(board) {
    if (!DEBUG)
        return;
    if (board.mailbox.length != 64) {
        throw new BoardStateError("Board mailbox length is " + board.mailbox.length);
    }
    if (!(board.toMove == WHITE || board.toMove == BLACK)) {
        throw new BoardStateError("Board toMove is " + board.toMove);
    }
    if (board.numReversibleMoves < 0) {
        throw new BoardStateError("Board numReversibleMoves is " + board.numReversibleMoves);
    }
}
