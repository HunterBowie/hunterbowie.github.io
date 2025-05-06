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
