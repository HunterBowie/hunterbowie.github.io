// These are all fatal errors

// when invalid FEN is being processed
export class FENProcessingError extends Error {
  constructor(message) {
    super(message);
    this.name = "FENProcessingError";
  }
}

// when a piece does not exist at a position when it should
export class MissingPieceError extends Error {
  constructor(message) {
    super(message);
    this.name = "MissingPieceError";
  }
}

// when a piece does not exist at a position when it should
export class InvalidPosError extends Error {
  constructor(pos) {
    super("The given position: " + pos.row + ", " + pos.col + " is invalid");
    this.name = "InvalidPosError";
  }
}

// when the board state is invalid in some way
export class BoardStateError extends Error {
  constructor(message) {
    super(message);
    this.name = "BoardStateError";
  }
}

// when the game state is invalid in some way
export class GameStateError extends Error {
  constructor(message) {
    super(message);
    this.name = "GameStateError";
  }
}
// when the position cannot be shifted because it will not be on the board
export class PositionShiftError extends Error {
  constructor(message) {
    super(message);
    this.name = "PositionShiftError";
  }
}
