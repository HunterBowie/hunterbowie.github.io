const go = new window.Go();
// PUBLIC FUNCTION DEFINITIONS
export function startUpdatingBotCommands(game) {
    WebAssembly.instantiateStreaming(fetch("go/main.wasm"), go.importObject).then(async (result) => {
        go.run(result.instance);
        game.onBotToMove(() => {
            console.log("CALCULATING MOVE");
            const rawMove = window.GetBotMove("classic", 0, 1000, "rnbqkbnr/pppppppp/8/8/8/111P1111/PPP1PPPP/RNBQKBNR b KQkq - 0 1");
            // NEED TO ADD FLAGS
            const move = {
                start: rawMove.slice(0, 2),
                end: rawMove.slice(2, 4),
                attack: false,
            };
            game.playMove(move);
        });
    });
}
