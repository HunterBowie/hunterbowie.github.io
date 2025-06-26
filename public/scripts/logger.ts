/**
 * Categories for logging.
 * GAME is anything related to the chess game itself
 *  (eg. moving a piece).
 * INPUT is anything related to the user's input
 *  (eg. clicking on a chess position).
 * NET is anything related to the network connection with the chess engine
 *  (eg. failed to get a reponse from the server).
 */
export enum LogCategory {
  GAME = "GAME",
  INPUT = "INPUT",
  NET = "NET",
  CASTLING = "CASTLING",
}

/**
 * For turning on and off the logging of different categories.
 */
const ENABLED_LOGS: Record<LogCategory, boolean> = {
  GAME: false,
  INPUT: false,
  NET: false,
  CASTLING: false,
};

/**
 * Repersents a logger for the chess engines application.
 */
export class Logger {
  static readonly GAME = LogCategory.GAME;
  static readonly INPUT = LogCategory.INPUT;
  static readonly NET = LogCategory.NET;
  static readonly CASTLING = LogCategory.CASTLING;

  static log(category: LogCategory, message: string) {
    if (ENABLED_LOGS[category]) {
      console.log(category + ": " + message);
    }
  }
}
