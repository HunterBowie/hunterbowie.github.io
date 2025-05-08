import { BoardStateError, FENProcessingError, InvalidPosError, } from "../errors.js";
import { BISHOP, BLACK, getColor, KING, KNIGHT, PAWN, QUEEN, ROOK, WHITE, } from "./piece.js";
import { DEBUG } from "../constants.js";
import { getRawMovesForPiece } from "./moves.js";
/**
 * Creates a standard board with no moves played.
 */
export function createStartingBoard() {
    return loadBoardPiecesFromFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
}
/**
 * Returns the board created by the given FEN notation.
 * Throws FENProcessingError if the given fen is invalid.
 */
function loadBoardPiecesFromFEN(fen) {
    const parts = fen.split(" ");
    if (parts.length != 6) {
        throw new FENProcessingError("The given FEN '" + fen + "' has the wrong number of parts");
    }
    const piecePlacement = parts[0];
    const toMove = parts[1];
    const castling = parts[2];
    const enPassant = parts[3];
    const halfMoves = parts[4];
    const fullMoves = parts[5];
    let board = {
        mailbox: new Array(64).fill(0),
        toMove: toMove == "w" ? WHITE : BLACK,
        whiteCastleRightsKingside: castling.includes("K"),
        whiteCastleRightsQueenside: castling.includes("Q"),
        blackCastleRightsKingside: castling.includes("k"),
        blackCastleRightsQueenside: castling.includes("q"),
        enPassant: enPassant == "-" ? null : fromAlgebraicPosition(enPassant),
        numHalfMoves: Number(halfMoves),
        numFullMoves: Number(fullMoves),
    };
    let row = 0;
    let col = 0;
    for (let i = 0; i < piecePlacement.length; i++) {
        let char = piecePlacement[i];
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
    return board;
}
/**
 * Returns the position from the given algebraic notation.
 */
function fromAlgebraicPosition(algebraic) {
    if (algebraic.length != 2) {
        throw new RangeError("Length of algebraic position " + algebraic + " is not 2. ");
    }
    const file = algebraic[0];
    const rank = algebraic[1];
    const row = 8 - Number(rank);
    const col = "abcdefgh".indexOf(file);
    return { row: row, col: col };
}
/**
 * Returns a copy of the given board.
 */
export function copyBoard(board) {
    return {
        mailbox: [...board.mailbox],
        toMove: board.toMove,
        whiteCastleRightsKingside: board.whiteCastleRightsKingside,
        whiteCastleRightsQueenside: board.whiteCastleRightsQueenside,
        blackCastleRightsKingside: board.blackCastleRightsKingside,
        blackCastleRightsQueenside: board.blackCastleRightsQueenside,
        enPassant: board.enPassant,
        numHalfMoves: board.numHalfMoves,
        numFullMoves: board.numFullMoves,
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
            if (piece === (board.toMove | KING)) {
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
                    if (move.end.row === kingsPos.row && move.end.col === kingsPos.col) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}
/**
 * Returns true if the given spots are under attack by the not to move color.
 */
export function isUnderAttack(spots, board) {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const pos = { row: row, col: col };
            const piece = getPiece(pos, board);
            if (piece != 0 && getColor(piece) != board.toMove) {
                const moves = getRawMovesForPiece(pos, board);
                for (let index = 0; index < moves.length; index++) {
                    const move = moves[index];
                    for (let spot of spots) {
                        if (move.end.row === spot.row && move.end.col === spot.col) {
                            return true;
                        }
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
export function changeTurn(board) {
    if (board.toMove === WHITE) {
        board.toMove = BLACK;
    }
    else {
        board.toMove = WHITE;
    }
}
// FOR INVARIANT
/**
 * Returns true if a king of the given color exists in a quantity of one on the given board.
 */
function hasOneKing(color, board) {
    let number = 0;
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const pos = { row: row, col: col };
            const piece = getPiece(pos, board);
            if (piece === (color | KING)) {
                number++;
            }
        }
    }
    if (number === 0)
        return false;
    if (number === 1)
        return true;
    return false;
}
/**
 * Returns true if there are white pawns on the first rank.
 */
function isWhitePawnOnImpossibleRank(board) {
    const row = 7; // rank 1
    for (let col = 0; col < 8; col++) {
        const piece = getPiece({ row: row, col: col }, board);
        if (piece === (WHITE | PAWN))
            return true;
    }
    return false;
}
/**
 * Returns true if there are black pawns on the eighth rank.
 */
function isBlackPawnOnImpossibleRank(board) {
    const row = 0; // rank 8
    for (let col = 0; col < 8; col++) {
        const piece = getPiece({ row: row, col: col }, board);
        if (piece === (BLACK | PAWN))
            return true;
    }
    return false;
}
/**
 * Checks if the board has invalid state when debug mode is enabled.
 * Throws BoardStateError if the board does not have valid state.
 */
export function assertBoardInvariant(board) {
    if (!DEBUG)
        return;
    if (board.mailbox.length != 64) {
        throw new BoardStateError("Board mailbox length is " + board.mailbox.length);
    }
    if (board.numHalfMoves < 0) {
        throw new BoardStateError("Board numHalfMoves is " + board.numHalfMoves);
    }
    if (board.numFullMoves < 1) {
        throw new BoardStateError("Board numFullMoves is " + board.numFullMoves);
    }
    if (!hasOneKing(WHITE, board)) {
        throw new BoardStateError("There is not one white king");
    }
    if (!hasOneKing(BLACK, board)) {
        throw new BoardStateError("There is not one black king");
    }
    if (isWhitePawnOnImpossibleRank(board)) {
        throw new BoardStateError("There are white pawns on the first rank");
    }
    if (isBlackPawnOnImpossibleRank(board)) {
        throw new BoardStateError("There are black pawns on the first rank");
    }
}
