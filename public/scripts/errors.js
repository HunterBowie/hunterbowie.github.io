class MissingPieceError extends Error {
    constructor(message) {
      super(message);
      this.name = "MissingPieceError";
    }
}