import { getCanvas, getSquareWidth } from "./draw.js";
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
    let hand = game.hand;
    window.addEventListener("mousedown", (event) => {
        const pos = getMousePos(event);
        game.clearPossibleMoves();
        if (game.canPickupPiece(pos)) {
            game.setPossibleMoves(pos);
            game.pickupPiece(pos);
            game.hoverHoldingPiece(getMousePoint(event));
        }
    });
    window.addEventListener("mouseup", (event) => {
        const pos = getMousePos(event);
        if (game.isHoldingPiece()) {
            game.dropPiece(pos);
        }
        // TODO: REMOVE
        hand = game.hand;
    });
    window.addEventListener("mousemove", (event) => {
        if (hand.piece != 0) {
            hand.hoverPoint = getMousePoint(event);
        }
    });
}
