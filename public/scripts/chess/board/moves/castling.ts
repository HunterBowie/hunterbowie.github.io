import { Logger } from "../../../logger.js";
import {
  Board,
  getFileNumber,
  getPiece,
  getRankNumber,
  makePos,
  nextTurn,
  Pos,
  shiftPos,
} from "../core.js";
import { EMPTY_PIECE, getColor, WHITE } from "../piece.js";
import { copyBoard } from "../utils.js";
import { findKingPos, isKingInCheck } from "./core.js";
import { getRawMoves } from "./raw.js";

// PUBLIC FUNCTION DEFINITIONS

/**
 * Returns true if the king to move has the potential to castle.
 * Performs checks that don't result in recursion.
 */
export function canCastleKingsideRaw(board: Board): boolean {
  Logger.log(Logger.CASTLING, "Performing raw checks for king castling.");
  // ---> neither the rook nor the king have previously moved <---

  const mightCastle =
    board.toMove === WHITE
      ? board.whiteCastleRightsKingside
      : board.blackCastleRightsKingside;

  if (!mightCastle) return false;

  //   Logger.log(
  //     Logger.CASTLING,
  //     "Neither the rook nor the king have previously moved"
  //   );

  // ---> check if pieces are in the way <---

  const pos = findKingPos(board);
  const endPos = shiftPos(pos, 0, 2);

  const spots = getSpotsFromFileRange(
    getRankNumber(pos),
    getFileNumber(pos),
    getFileNumber(endPos)
  );

  const spotsWithoutKing = spots.filter((spot) => spot !== pos);

  if (containsPieces(spotsWithoutKing, board)) return false;

  //   Logger.log(Logger.CASTLING, "No pieces in the way");

  return true;
}

/**
 * Returns true if the king can castle kingside.
 * Requires canCastleKingsideRaw(board)
 */
export function canCastleKingside(board: Board): boolean {
  const pos = findKingPos(board);
  const endPos = shiftPos(pos, 0, 2);

  const spots = getSpotsFromFileRange(
    getRankNumber(pos),
    getFileNumber(pos),
    getFileNumber(endPos)
  );

  Logger.log(Logger.CASTLING, "Doing legal checks for castling");

  // ---> the king cannot be in check <---

  if (isKingInCheck(board)) return false;

  Logger.log(Logger.CASTLING, "The King is not in check");

  // ---> the king does not pass through attacked squares <---

  Logger.log(
    Logger.CASTLING,
    `Checking the spots: ${spots.toString()} for being under attack`
  );
  if (isUnderAttack(spots, board)) return false;

  Logger.log(Logger.CASTLING, "The king is allowed to castle");

  // the king can castle
  return true;
}

/**
 * Modifes the castling rights of the to move color on the given board to all be false.
 */
export function removeAllCastlingRights(board) {
  removeKingsideCastlingRights(board);
  removeQueensideCastlingRights(board);
}

/**
 * Modifes the castling rights of the to move color on the given board to be false for
 * kingside castling.
 */
export function removeKingsideCastlingRights(board) {
  if (board.toMove == WHITE) {
    board.whiteCastleRightsKingside = false;
  } else {
    board.blackCastleRightsKingside = false;
  }
}

/**
 * Modifes the castling rights of the to move color on the given board t to be false for
 * queenside castling.
 */
export function removeQueensideCastlingRights(board) {
  if (board.toMove == WHITE) {
    board.whiteCastleRightsQueenside = false;
  } else {
    board.blackCastleRightsQueenside = false;
  }
}

// PRIVATE FUNCTION DEFINTIONS

/**
 * Returns the spots in the given file range (inclusive).
 * Requires rankNum, fileStartNum, and fileEndNum to be in the range 1-8
 * and fileStartNum <= fileEndNum
 */
function getSpotsFromFileRange(
  rankNum: number,
  fileStartNum: number,
  fileEndNum: number
): Pos[] {
  let spots: Pos[] = [];
  for (let fileNum = fileStartNum; fileNum <= fileEndNum; fileNum++) {
    spots.push(makePos(rankNum, fileNum));
  }
  return spots;
}

/**
 * Returns true if there are any pieces occuping the spots on the given board.
 * Throws BoardStateError if a board with an invalid mailbox is passed.
 */
function containsPieces(spots: Pos[], board: Board): boolean {
  for (let index = 0; index < spots.length; index++) {
    if (getPiece(spots[index], board) !== 0) {
      return true;
    }
  }
  return false;
}

/**
 * Returns true if the given spots are under attack by opposing color
 * (ei. not the color to move).
 * Throws BoardStateError if a board with an invalid mailbox is passed.
 */
function isUnderAttack(spots: Pos[], board: Board): boolean {
  // must be done to get moves for enemy pieces
  const boardCopy = copyBoard(board);
  nextTurn(boardCopy);

  for (let rankNum = 1; rankNum <= 8; rankNum++) {
    for (let fileNum = 1; fileNum <= 8; fileNum++) {
      const pos = makePos(rankNum, fileNum);
      const piece = getPiece(pos, board);
      if (piece !== EMPTY_PIECE && getColor(piece) !== board.toMove) {
        const moves = getRawMoves(pos, boardCopy).filter((move) => move.attack);
        for (let index = 0; index < moves.length; index++) {
          const move = moves[index];
          for (let spot of spots) {
            if (move.end === spot) {
              return true;
            }
          }
        }
      }
    }
  }
  return false;
}
