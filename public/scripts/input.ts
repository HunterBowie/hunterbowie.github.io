import { makePos, Pos } from "./chess/board/core.js";
import { Game, Point } from "./chess/game.js";
import { getCanvas, getSquareWidth } from "./draw/core.js";
import { Logger } from "./logger.js";

/**
 * Get the mouse point of the event relative to the canvas.
 */
function getMousePoint(event: MouseEvent): Point {
  const rect = getCanvas().getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  return { x: x, y: y };
}

/**
 * Returns true if the mouse point from the given event is within the canvas.
 */
function isMousePointFocused(event: MouseEvent): boolean {
  const rect = getCanvas().getBoundingClientRect();
  if (event.clientX < rect.right && event.clientY < rect.bottom) {
    if (event.clientX > rect.left && event.clientY > rect.top) {
      return true;
    }
  }
  return false;
}

/**
 * Get the mouse point of the event relative to the canvas.
 */
function getMousePos(event: MouseEvent): Pos | null {
  const point = getMousePoint(event);
  const row = Math.floor(point.y / getSquareWidth());
  const col = Math.floor(point.x / getSquareWidth());
  const rankNum = 8 - row;
  const fileNum = col + 1;
  try {
    return makePos(rankNum, fileNum);
  } catch (error: unknown) {
    if (error instanceof RangeError) {
      return null;
    }
    throw error;
  }
}

/**
 * Starts the process of updating the game based on user input.
 */
export function startUpdatingInput(game: Game) {
  window.addEventListener("pointerdown", (event) => {
    Logger.log(
      Logger.INPUT,
      `Mouse down ... determining whether its valid pos`
    );
    const point = getMousePoint(event);
    const pos = getMousePos(event);

    if (pos === null) return;

    Logger.log(Logger.INPUT, `Mouse down at ${pos}`);

    if (game.canPickPiece(pos)) {
      Logger.log(Logger.INPUT, `Picking up/Selectin piece...`);
      game.unselectPiece();
      if (event.pointerType === "mouse") {
        game.pickupPiece(pos, point);
      } else {
        game.selectPiece(pos);
      }
    } else if (game.hasSelectedPiece()) {
      const moves = game.getMovesForSelectedPiece();
      const filteredMoves = moves.filter((move) => move.end === pos);
      const hasMove = filteredMoves.length === 1;
      if (hasMove) {
        game.unselectPiece();
        game.playMove(filteredMoves[0]);
      }
    }
  });

  window.addEventListener("contextmenu", (event) => {
    if (isMousePointFocused(event)) {
      event.preventDefault();
    }
  });

  window.addEventListener("pointerup", (event) => {
    const pos = getMousePos(event);
    if (pos === null) {
      if (game.isHoldingPiece()) {
        game.returnHeldPiece();
      }
    }
    Logger.log(Logger.INPUT, `The mouse is lifting up at ${pos}`);
    if (game.isHoldingPiece()) {
      const moves = game.getMovesForHeldPiece();
      const filteredMoves = moves.filter((move) => move.end === pos);
      const hasMove = filteredMoves.length === 1;
      game.returnHeldPiece();
      if (hasMove) {
        game.playMove(filteredMoves[0]);
      }
    }
  });

  window.addEventListener("mousemove", (event) => {
    if (game.isHoldingPiece()) {
      game.hoverHoldingPiece(getMousePoint(event));
    }
  });
}
