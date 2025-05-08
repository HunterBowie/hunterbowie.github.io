import { getCanvas, getSquareWidth } from "./draw/core.js";
/**
 * Get the mouse point of the event relative to the canvas.
 */
function getMousePoint(event) {
    const rect = getCanvas().getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return { x: x, y: y };
}
/**
 * Returns true if the mouse point from the given event is within the canvas.
 */
function isMousePointFocused(event) {
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
function getMousePos(event) {
    const point = getMousePoint(event);
    const row = Math.floor(point.y / getSquareWidth());
    const col = Math.floor(point.x / getSquareWidth());
    return { row: row, col: col };
}
/**
 * Starts the process of updating the game based on user input.
 */
export function startUpdatingInput(game) {
    window.addEventListener("pointerdown", (event) => {
        const pos = getMousePos(event);
        const point = getMousePoint(event);
        if (game.canPickupPiece(pos)) {
            game.clearSelectedPiece();
            if (event.pointerType === "mouse") {
                game.pickupPiece(pos, point);
            }
            else {
                game.selectPiece(pos);
            }
        }
        else if (game.hasSelectedPiece()) {
            if (game.canMoveSelectedPiece(pos)) {
                game.moveSelectedPiece(pos);
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
        if (game.isHoldingPiece()) {
            game.dropPiece(pos);
        }
    });
    window.addEventListener("mousemove", (event) => {
        if (game.isHoldingPiece()) {
            game.hoverHoldingPiece(getMousePoint(event));
        }
    });
}
