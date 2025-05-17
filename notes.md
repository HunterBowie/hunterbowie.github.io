

### Example Logging

```
GAME: White to move
GAME: White plays e4
GAME: Black to move

INPUT: User clicked on b2
INPUT: User is holding a Pawn
INPUT: User has dropped the Pawn at b3

ENGINE: "Minimax" selected
ENGINE: played e5
```


### Example use of Game

```typescript
const game = new Game();

game.playMove({start: "b2", end: "b4"});

const board = game.GetBoard();
const fenBoard = toFEN(board);
```