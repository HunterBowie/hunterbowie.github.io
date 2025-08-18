import { makePos, Pos } from "./chess/board/core.js";
import { Move } from "./chess/board/moves/core.js";
import { BISHOP, KNIGHT, PieceType, QUEEN, ROOK } from "./chess/board/piece.js";
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
 * Adds button functionality.
 */
function setupButtons(game: Game) {
  const undoButton = document.getElementById("undo-btn");
  undoButton.addEventListener("click", (_) => {
    game.undoMove();
  });
  undoButton.addEventListener("touchend", (_) => {
    game.undoMove();
  });
}

/**
 * Starts the process of updating the game based on user input.
 */
export function startUpdatingInput(game: Game) {
  setupButtons(game);
  const keysPressed = new Set<string>();
  const promotionKeys = ["r", "k", "b", "q"];
  const promotionTypes = [ROOK, KNIGHT, BISHOP, QUEEN];

  window.addEventListener("keydown", (event) => keysPressed.add(event.key));
  window.addEventListener("keyup", (event) => keysPressed.delete(event.key));

  /**
   * Returns true if the user has held down promotion relevant keys.
   */
  function hasPromotionInput(): boolean {
    return promotionKeys.some((key) => keysPressed.has(key));
  }

  /**
   * Returns the piece type to promote to given which keys the user has held down.
   * Throws Error if !hasPromotionInput().
   */
  function getPromotionInput(): PieceType {
    for (let key of promotionKeys) {
      if (keysPressed.has(key)) {
        return promotionTypes[promotionKeys.indexOf(key)];
      }
    }
    throw Error(
      "hasPromotionInput() cannot be false when getPromotionInput() is called"
    );
  }

  /**
   * Process the promotion input from the user for the given move
   * if that move is a promotion.
   */
  function processPromotionInput(move: Move) {
    if (game.isPromotionMove(move)) {
      if (hasPromotionInput()) {
        game.nextPiecePromotesTo(getPromotionInput());
      }
    }
  }

  window.addEventListener("pointerdown", (event) => {
    if (game.isOver() || !game.isHumanPlayerToMove()) return;
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
        const move = filteredMoves[0];
        game.unselectPiece();
        processPromotionInput(move);
        game.playMove(move);
      }
    }
  });

  window.addEventListener("contextmenu", (event) => {
    if (isMousePointFocused(event)) {
      event.preventDefault();
    }
  });

  window.addEventListener("pointerup", (event) => {
    if (game.isOver() || !game.isHumanPlayerToMove()) return;
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
        const move = filteredMoves[0];
        processPromotionInput(move);
        game.playMove(move);
      }
    }
  });

  window.addEventListener("mousemove", (event) => {
    if (game.isOver() || !game.isHumanPlayerToMove()) return;
    if (game.isHoldingPiece()) {
      game.hoverHoldingPiece(getMousePoint(event));
    }
  });
}
