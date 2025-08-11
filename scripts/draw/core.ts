import { BLACK } from "../chess/board/piece.js";
import {
  CANVAS_MARGIN,
  CHESS_BOARD_ID,
  TOP_PANEL_HEIGHT,
} from "../constants.js";
import { getCanvasWidth } from "./utils.js";

const pieceNames = ["pawn", "bishop", "knight", "rook", "queen", "king"];

export let pieceImages = {};

/**
 * Initializes the context/canvas with the proper configs.
 */
export function initDraw(): Promise<unknown[]> {
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
 */
export function getCanvas(): HTMLCanvasElement {
  return document.getElementById(CHESS_BOARD_ID) as HTMLCanvasElement;
}

/**
 * Gets the context of the chess board canvas.
 */
export function getContext(): CanvasRenderingContext2D {
  return getCanvas().getContext("2d") as CanvasRenderingContext2D;
}

/**
 * Get the chess board tile width.
 */
export function getSquareWidth(): number {
  return getCanvasWidth() / 8;
}

/**
 * Draws a rectangle filled with the given color to the context.
 */
export function drawRect(
  color: string,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const ctx = getContext();
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
}

/**
 * Draws black text with the given font size to the context.
 */
export function drawText(
  text: string,
  xCenter: number,
  yCenter: number,
  fontSize: number,
  bold: boolean = false
) {
  const ctx = getContext();
  ctx.font = `${fontSize}px Verdana`;
  if (bold) {
    ctx.font = "bold " + ctx.font;
  }
  ctx.fillStyle = "black";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, xCenter, yCenter);
}

/**
 * Resizes the canvas to fit the window size.
 */
function resize() {
  const ctx = getContext();
  const canvas = getCanvas();

  const min =
    Math.min(window.innerWidth, window.innerHeight - 20) - CANVAS_MARGIN;

  // if window.innerHeight > window.innerWidth
  const height = min;
  const width = min - TOP_PANEL_HEIGHT;

  const dpr = window.devicePixelRatio || 1;

  // Set internal resolution
  canvas.width = width * dpr;
  canvas.height = height * dpr;

  // Set CSS (display) size
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  // Scale context so all drawing uses CSS pixels
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
