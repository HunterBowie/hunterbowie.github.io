import { getCanvas } from "./core.js";

// PUBLIC FUNCTION DEFINITIONS

/**
 * Returns the width of the canvas.
 */
export function getCanvasWidth(): number {
  return Number(getCanvas().style.width.slice(0, -2));
}

/**
 * Returns the center x and y value on the canvas.
 */
export function calcXYCenter(): number {
    return getCanvasWidth() / 2;
}
