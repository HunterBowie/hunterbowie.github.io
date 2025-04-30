import {
  CANVAS_MARGIN,
  CHESS_BOARD_ID,
  DARK_SQUARE,
  LIGHT_SQUARE,
} from "./constants.js";

/**
 * Gets the canvas that repersents the chess board.
 * @returns { HTMLCanvasElement }
 */
export function getCanvas() {
  return document.getElementById(CHESS_BOARD_ID);
}

/**
 * Gets the context of the chess board canvas.
 * @returns { CanvasRenderingContext2D }
 */
export function getContext() {
  return getCanvas().getContext("2d");
}

/**
 * Get the chess board tile width.
 * @returns { number }
 */
export function getSquareWidth() {
  return Number(getCanvas().style.width.slice(0, -2)) / 8;
}

/**
 * Draws the chess board background.
 */
function drawBoardTiles() {
  const squareWidth = getSquareWidth();
  for (let row = 0; row <= 8; row++) {
    for (let col = 0; col <= 8; col++) {
      let color = DARK_SQUARE;
      if ((row + col) % 2 === 0) {
        color = LIGHT_SQUARE;
      }
      drawRect(
        color,
        col * squareWidth,
        row * squareWidth,
        squareWidth,
        squareWidth
      );
    }
  }
}

/**
 * Returns the file path to the image for the given piece.
 * @param { number } piece
 */
function findPath(piece) {
  let color = "white";
  if (piece & (0b1000 != 0)) {
    color = "black";
  }
  const pieceOrder = ["pawn", "bishop", "knight", "rook", "queen", "king"];
  const pieceType = pieceOrder[piece & 0b0111];

  return "assets/" + color + "-" + pieceType + ".png";
}

/**
 * Draws the chess board pieces.
 * @param { Array }
 */
function drawBoardPieces(board) {
  const squareWidth = getSquareWidth();
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      drawImage(
        findPath(board[row][col]),
        col * squareWidth,
        row * squareWidth,
        squareWidth,
        squareWidth
      );
    }
  }
}

/**
 * Resizes the canvas to fit the window size.
 */
export function resize() {
  const ctx = getContext();
  const canvas = getCanvas();

  const size = Math.min(window.innerWidth, window.innerHeight) - CANVAS_MARGIN;

  const dpr = window.devicePixelRatio || 1;

  // Set internal resolution
  canvas.width = size * dpr;
  canvas.height = size * dpr;

  // Set CSS (display) size
  canvas.style.width = `${size}px`;
  canvas.style.height = `${size}px`;

  // Scale context so all drawing uses CSS pixels
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

/**
 * Initializes the context/canvas with the proper configs.
 */
export function initDraw() {
  resize();
  window.addEventListener("resize", () => resize());

  //   loadImages()
}

/**
 * Updates the display using an interval.
 */
export function updateDrawingAtInterval(board) {
  setInterval(() => {
    drawBoardTiles();
    drawBoardPieces(board);
  }, 1000);
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
