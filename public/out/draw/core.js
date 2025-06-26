import { BLACK } from "../chess/board/piece.js";
import { CANVAS_MARGIN, CHESS_BOARD_ID } from "../constants.js";
import { getCanvasWidth } from "./utils.js";
const pieceNames = ["pawn", "bishop", "knight", "rook", "queen", "king"];
export let pieceImages = {};
/**
 * Initializes the context/canvas with the proper configs.
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
        }
        else {
            index -= allPieces.length / 2;
            pieceImages[(index + 1) | BLACK] = image;
        }
    });
    return Promise.all(Array.from(allPieces).map((image) => new Promise((resolve) => image.addEventListener("load", resolve))));
}
/**
 * Gets the canvas that repersents the chess board.
 */
export function getCanvas() {
    return document.getElementById(CHESS_BOARD_ID);
}
/**
 * Gets the context of the chess board canvas.
 */
export function getContext() {
    return getCanvas().getContext("2d");
}
/**
 * Get the chess board tile width.
 */
export function getSquareWidth() {
    return getCanvasWidth() / 8;
}
/**
 * Draws a rectangle filled with the given color to the context.
 */
export function drawRect(color, x, y, width, height) {
    const ctx = getContext();
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}
/**
 * Draws black text with the given font size to the context.
 */
export function drawText(text, xCenter, yCenter, fontSize) {
    const ctx = getContext();
    ctx.font = `${fontSize}px Verdana`;
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
    const infoBar = document.getElementById("info-bar");
    const size = Math.min(window.innerWidth, window.innerHeight - 20) - CANVAS_MARGIN;
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
