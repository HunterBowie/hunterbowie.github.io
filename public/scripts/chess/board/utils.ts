// PUBLIC FUNCTION DEFINTIONS

import { Board, getPiece, makePos, Pos } from "./core.js";
import { getValidMoves } from "./moves/core.js";
import { getColor } from "./piece.js";

/**
 * Returns a copy of the given board.
 * Modifications to this board will not affect the other board.
 */
export function copyBoard(board: Board): Board {
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
 * Returns true if the given spots are under attack by opposing color
 * (ei. not the color to move).
 * Throws BoardStateError if a board with an invalid mailbox is passed.
 */
export function isUnderAttack(spots: Pos[], board: Board): boolean {
  for (let rankNum = 1; rankNum <= 8; rankNum++) {
    for (let fileNum = 1; fileNum <= 8; fileNum++) {
      const pos = makePos(rankNum, fileNum);
      const piece = getPiece(pos, board);
      if (piece != 0 && getColor(piece) != board.toMove) {
        const moves = getValidMoves(pos, board);
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
