import {
  CANVAS_MARGIN,
  CHESS_BOARD_ID,
  DARK_SQUARE,
  DRAW_DELAY,
  LIGHT_SQUARE,
} from "./constants.js";

import { BLACK } from "./chess.js";

const pieceNames = ["pawn", "knight", "bishop", "rook", "queen", "king"];

let pieceImages = {};

/**
 * Initializes the context/canvas with the proper configs.
 * @returns { Promise }
 */
export function initDraw() {
  // setup canvas resizing
  resize();
  window.addEventListener("resize", () => resize());

  // load images
  const whitePiecesNames = pieceNames.map((name) => "white-" + name);
  const blackPiecesNames = pieceNames.map((name) => "black-" + name);
  const allPiecesNames = whitePiecesNames.concat(blackPiecesNames);
  const allPieces = allPiecesNames.map((name) => {
    let image = new Image();
    image.src = "assets/" + name + ".png";
    return image;
  });

  allPieces.forEach((image, index) => {
    if (index < allPieces.length / 2) {
      pieceImages[index + 1] = image;
    } else {
      index -= allPieces.length / 2;
      pieceImages[(index + 1) | BLACK] = image;
    }
  });

  return Promise.all(
    Array.from(allPieces).map(
      (image) =>
        new Promise((resolve) => image.addEventListener("load", resolve))
    )
  );
}

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
 * Draws the chess board pieces.
 * @param { number[][] }
 */
function drawBoardPieces(board) {
  const squareWidth = getSquareWidth();
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (board[row][col] === 0) {
        continue;
      }
      drawPieceImage(
        board[row][col],
        col * squareWidth,
        row * squareWidth
      );
    }
  }
}

/**
 * Resizes the canvas to fit the window size.
 */
function resize() {
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
 * Starts a process of updating the drawings.
 * @param { Game } game
 */
export function startUpdatingDrawing(game) {
  setInterval(() => {
    drawBoardTiles();
    drawBoardPieces(game.board);
    drawHeldPiece(game);
  }, DRAW_DELAY);
}

/**
 * Draws the held piece.
 * @param { Game } game
 */
function drawHeldPiece(game) {
  if (game.heldPiece == 0) {
    return;
  }
  const halfPieceWidth = Math.floor(getSquareWidth() / 2);
  drawPieceImage(
    game.heldPiece,
    game.heldPiecePoint.x - halfPieceWidth,
    game.heldPiecePoint.y - halfPieceWidth
  );
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
 * @param {number} piece
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 */
export function drawPieceImage(piece, x, y) {
  const squareWidth = getSquareWidth();
  getContext().drawImage(pieceImages[piece], x, y, squareWidth, squareWidth);
}
