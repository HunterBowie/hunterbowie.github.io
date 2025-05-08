# Chess Engines

Creating a website to interact with several custom built chess engines.


# Day 1

### Things Done

- created a rough structure for the project 
- a basic website that is mostly made with chatgpt that allows frontend to communicate with backend that then runs a CPP file and returns the result

### Things To Do

- learn about some of the tools/packages used
- play around with the code to make it do more complicated things 


# Day 2

### Things Done

- got a board rendered to the website
- got github pages working
- got the whole canvas javascript thing figured out
- started learning about javascript more and using jsdoc
- managed to figure out how to do proper scaling with dpi (ie. chatgpt did)


### Things To Do

- Need to figure out how to update the drawing every _ seconds
- Need to get basic mouse interaction working 
- Need to make a board repersentation for the front end and some basic functionally to work with it (moving pieces)


# Day 3

### Things Done

- Figured out piece move legality (except knight)
- Color scheme and highlighting effect implementation
- Organized javascript files more

### Things To Do

- Finish move legality implementation
- Start to actually implement game logic and turns ect.
- Get some kind of text to display scoreboard king of stuff like current turn,
 number of turns passed, piece score, computer eval score ect.


....


# May 6th

- Improve the coverage of the invariant for board (things like there being no king)
- Begin writing a test suite for getMoves()
- Flesh out the public interface for Game and how it will interact with engine
- Add requires clauses to the nessesary functions

# May 7th

- The board interface is good. Keep it, don't make it into a class. 
- Decide what the standard notation for positions moves will be internally (within game) and externally (talking to the game class)
- Refactor moves and board into one folder called "board" that splits up the various functions
- Write out comments on the standards/terminology being used
- Make all the functions within the board "package" robust 
- Make some simple tests for anything testable you find in board package
- Flesh out the public interface for Game and how it will interact with engine
