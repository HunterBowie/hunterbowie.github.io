export class MissingPieceError extends Error {
  constructor(message) {
    super(message);
    this.name = "MissingPieceError";
  }
}

export class PieceMovementError extends Error {
  constructor(message) {
    super(message);
    this.name = "PieceMovementError";
  }
}

export class FENProcessingError extends Error {
  constructor(message) {
    super(message);
    this.name = "FENProcessingError";
  }
}

export class IllegalBoardError extends Error {
  constructor(message) {
    super(message);
    this.name = "IllegalBoardError";
  }
}
