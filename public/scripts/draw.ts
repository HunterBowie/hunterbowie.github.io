import {
    CANVAS_MARGIN,
    CHESS_BOARD_ID,
    DARK_SQUARE,
    DRAW_DELAY,
    HIGHLIGHT_SQUARE,
    LIGHT_SQUARE,
    SPECIAL_HIGHLIGHT_SQUARE,
} from "./constants.js";

import { getPiece } from "./chess/board.js";
import { Game, Hand, Point } from "./chess/game.js";

import { Move, Pos } from "./chess/moves.js";
import { BLACK } from "./chess/piece.js";

const pieceNames = ["pawn", "bishop", "knight", "rook", "queen", "king"];

let pieceImages = {};

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
  ));
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
 */
function drawBoardPieces(game: Game) {
  const squareWidth = getSquareWidth();
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (getPiece({ row: row, col: col }, game.board) == 0) {
        continue;
      }
      drawPieceImage(
        getPiece({ row: row, col: col }, game.board),
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
  const infoBar = document.getElementById("info-bar") as HTMLElement;

  const size =
    Math.min(window.innerWidth, window.innerHeight - 20) - CANVAS_MARGIN;

  const dpr = window.devicePixelRatio || 1;

  infoBar.style.width = `${size}px`;

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
 * Draws the highlighted squares to the canvas.
 */
function drawPossibleMoves(moves: Move[]) {
  const squareWidth = getSquareWidth();
  moves.forEach((move, _) => {
    drawRect(
      HIGHLIGHT_SQUARE,
      move.end.col * squareWidth,
      move.end.row * squareWidth,
      squareWidth,
      squareWidth
    );
  });
}

/**
 * Starts a process of updating the drawings.
 */
export function startUpdatingDrawing(game: Game) {
  setInterval(() => {
    drawBoardTiles();
    drawPossibleMoves(game.possibleMoves);
    drawCurrentPieceTile(game.hand);
    drawBoardPieces(game);
    drawHand(game.hand);
  }, DRAW_DELAY);
}

/**
 * Draws the highlighted tile for the piece's home square
 * if it is picked up.
 */
function drawCurrentPieceTile(hand: Hand) {
  if (hand.piece == 0) {
    return;
  }

  drawRect(
    SPECIAL_HIGHLIGHT_SQUARE,
    (hand.homePos as Pos).col * getSquareWidth(),
    (hand.homePos as Pos).row * getSquareWidth(),
    getSquareWidth(),
    getSquareWidth()
  );
}

/**
 * Draws the held piece.
 */
function drawHand(hand: Hand) {
  if (hand.piece == 0) {
    return;
  }
  const halfPieceWidth = Math.floor(getSquareWidth() / 2);
  drawPieceImage(
    hand.piece,
    (hand.hoverPoint as Point).x - halfPieceWidth,
    (hand.hoverPoint as Point).y - halfPieceWidth
  );
}

/**
 * Draws a rectangle filled with the given color to the context.
 */
export function drawRect(color: string, x: number, y: number, width: number, height: number) {
  const ctx = getContext();
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
}

/**
 * Draws an image to the context (better for a single image).
 */
export function drawPieceImage(piece: number, x: number, y: number) {
  const squareWidth = getSquareWidth();
  getContext().drawImage(pieceImages[piece], x, y, squareWidth, squareWidth);
}
