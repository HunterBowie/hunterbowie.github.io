import { DARK_SQUARE, LIGHT_SQUARE, SQUARE_WIDTH } from "./constants.js";
import { drawImage, drawRect, initDraw } from "./draw.js";

/**
 * Draws the chess board to the screen.
 */
function drawChessBoard() {
  initDraw();

  for (let row = 0; row <= 8; row++) {
    for (let col = 0; col <= 8; col++) {
      let color = DARK_SQUARE;
      if ((row + col) % 2 === 0) {
        color = LIGHT_SQUARE;
      }
      drawRect(
        color,
        col * SQUARE_WIDTH,
        row * SQUARE_WIDTH,
        SQUARE_WIDTH,
        SQUARE_WIDTH
      );
    }
  }
  drawImage("assets/black-queen.png", 0, 0, SQUARE_WIDTH, SQUARE_WIDTH);
  drawImage(
    "assets/white-queen.png",
    SQUARE_WIDTH,
    0,
    SQUARE_WIDTH,
    SQUARE_WIDTH
  );
  drawImage(
    "assets/white-bishop.png",
    0,
    SQUARE_WIDTH * 3,
    SQUARE_WIDTH,
    SQUARE_WIDTH
  );
  drawImage(
    "assets/black-rook.png",
    SQUARE_WIDTH * 7,
    SQUARE_WIDTH * 3,
    SQUARE_WIDTH,
    SQUARE_WIDTH
  );
  drawImage(
    "assets/white-knight.png",
    SQUARE_WIDTH,
    SQUARE_WIDTH * 3,
    SQUARE_WIDTH,
    SQUARE_WIDTH
  );
}

window.addEventListener("load", drawChessBoard);
