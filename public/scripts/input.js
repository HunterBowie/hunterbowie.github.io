import { getCanvas, getSquareWidth } from "./draw.js";

/**
 * Get the mouse point of the event relative to the canvas.
 * @param { MouseEvent } event
 * @returns { Point }
 */
function getMousePoint(event) {
  const rect = getCanvas().getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  return { x: x, y: y };
}

/**
 * Get the mouse point of the event relative to the canvas.
 * @param { MouseEvent } event
 * @returns { Pos }
 */
function getMousePos(event) {
  const point = getMousePoint(event);
  const row = Math.floor(point.y / getSquareWidth());
  const col = Math.floor(point.x / getSquareWidth());
  return { row: row, col: col };
}

/**
 * Starts the process of updating the game based on user input.
 * @param { Game } game
 */
export function startUpdatingInput(game) {
  let board = game.board;
  let heldSlot = game.heldSlot;

  window.addEventListener("mousedown", (event) => {
    // game.setPossibleMoves()
    // game.clearPossibleMoves();
    // game.canPickup(pos);
    // game.pickupPiece(pos);
    // game.possibleMoves = [];
    // if (isInvalidPos(pos)) {
    //   return;
    // }
    // const piece = board[pos.row][pos.col];
    // if (piece == 0) {
    //   return;
    // }
    // game.possibleMoves = getMoves(pos, board);
    // heldSlot.piece = piece;
    // board[pos.row][pos.col] = 0;
    // heldSlot.homePos = pos;
    const pos = getMousePos(event);

    game.clearPossibleMoves();

    if (game.canPickupPiece(pos)) {
      game.setPossibleMoves(pos);
      game.pickupPiece(pos);
      game.hoverHoldingPiece(getMousePoint(event));
    }

    // heldSlot.hoverPoint = getMousePoint(event);
  });

  window.addEventListener("mouseup", (event) => {
    const pos = getMousePos(event);
    if (game.isHoldingPiece()) {
      game.dropPiece(pos);
    }
    // TODO: REMOVE
    heldSlot = game.heldSlot;

    // if (heldSlot.piece === 0) return;

    // // now must be holding a piece

    // const hasPossibleMove = game.possibleMoves.filter(
    //   (move) => move.row === pos.row && move.col === pos.col
    // );
    // if (isInvalidPos(pos) || hasPossibleMove.length == 0) {
    //   // return piece to orginal square
    //   board[heldSlot.homePos.row][heldSlot.homePos.col] = heldSlot.piece;
    //   game.heldSlot = { piece: 0, homePos: null, hoverPoint: null };
    //   heldSlot = game.heldSlot;
    //   return;
    // }

    // // move piece to valid move
    // board[pos.row][pos.col] = heldSlot.piece;
    // game.heldSlot = { piece: 0, homePos: null, hoverPoint: null };
    // heldSlot = game.heldSlot;

    // game.possibleMoves = [];
  });

  window.addEventListener("mousemove", (event) => {
    // game.isHoldingPiece();
    // game.hoverHoldingPiece(getMousePoint(event));
    if (heldSlot.piece != 0) {
      heldSlot.hoverPoint = getMousePoint(event);
    }
  });
}
