import { BOARD_WIDTH, CHESS_BOARD_ID } from "./constants.js";

/**
 * Gets the canvas that repersents the chess board.
 * @returns {HTMLCanvasElement}
 */
export function getCanvas() {
  return document.getElementById(CHESS_BOARD_ID);
}

/**
 * Gets the context of the chess board canvas.
 * @returns {CanvasRenderingContext2D}
 */
export function getContext() {
  return getCanvas().getContext("2d");
}

/**
 * Initializes the context/canvas with the proper configs.
 * @param {CanvasRenderingContext2D} context
 * @param {Canvas} context
 */
export function initDraw() {
  const ctx = getContext();
  const canvas = getCanvas();

  const dpr = window.devicePixelRatio || 1;

  // Set internal resolution
  canvas.width = BOARD_WIDTH * dpr;
  canvas.height = BOARD_WIDTH * dpr;

  // Set CSS (display) size
  canvas.style.width = `${BOARD_WIDTH}px`;
  canvas.style.height = `${BOARD_WIDTH}px`;

  // Scale context so all drawing uses CSS pixels
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

/**
 * Draws a rectangle filled with the given color to the context.
 * @param {string} color
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 */
export function drawRect(color, x, y, width, height) {
  const ctx = getContext();
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
}

/**
 * Draws an image to the context (better for a single image).
 * @param {string} imagePath
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 */
export function drawImage(imagePath, x, y, width, height) {
  const ctx = getContext();
  const image = new Image();

  image.addEventListener("load", () => {
    ctx.drawImage(image, x, y, width, height);
  });

  image.src = imagePath;
}
