// PUBLIC FUNCTION DEFINTIONS
/**
 * Returns a copy of the given board.
 * Modifications to this board will not affect the other board.
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
