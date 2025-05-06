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
    window.addEventListener("mousedown", (event) => {
        // cleanup
        const pos = getMousePos(event);
        const point = getMousePoint(event);
        if (game.canPickupPiece(pos)) {
            game.clearSelectedPiece();
            game.pickupPiece(pos, point);
            game.hoverHoldingPiece(getMousePoint(event));
        }
        else if (game.hasSelectedPiece()) {
            if (game.canMoveSelectedPiece(pos)) {
                game.moveSelectedPiece(pos);
            }
        }
    });
    window.addEventListener("mouseup", (event) => {
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
