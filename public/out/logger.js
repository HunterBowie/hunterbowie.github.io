/**
 * Categories for logging.
 * GAME is anything related to the chess game itself
 *  (eg. moving a piece).
 * INPUT is anything related to the user's input
 *  (eg. clicking on a chess position).
 * NET is anything related to the network connection with the chess engine
 *  (eg. failed to get a reponse from the server).
 */
export var LogCategory;
(function (LogCategory) {
    LogCategory["GAME"] = "GAME";
    LogCategory["INPUT"] = "INPUT";
    LogCategory["NET"] = "NET";
    LogCategory["CASTLING"] = "CASTLING";
})(LogCategory || (LogCategory = {}));
/**
 * For turning on and off the logging of different categories.
 */
const ENABLED_LOGS = {
    GAME: false,
    INPUT: false,
    NET: false,
    CASTLING: true,
};
/**
 * Repersents a logger for the chess engines application.
 */
export class Logger {
    static GAME = LogCategory.GAME;
    static INPUT = LogCategory.INPUT;
    static NET = LogCategory.NET;
    static CASTLING = LogCategory.CASTLING;
    static log(category, message) {
        if (ENABLED_LOGS[category]) {
            console.log(category + ": " + message);
        }
    }
}
