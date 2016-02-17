# fmi-js-cb-arena
Project for Advanced JS course at FMI. A multiplayer guessing game.

## Installation

1. Install Node.js
1. On the root of the project run in a console:

 - `npm install`
 - `npm install jasmine -g`

## Running the app

On the root of the project run in a console:

- `npm start`
- You will now be able to open http://localhost:7076/ where there is a UI for Cows and Bulls.

## Running tests

On the root of the project run in a console:

- `npm test`

## Project specifications

The project is implementation of a game. We shall call this game Cows & Bulls: Arena.

Rules of the game:
- in a game one to unlimited number of players compete agains each other; 
- in a game there is exactly one unique and secret number which none of the players know. This number consists of 4 unique digits; 
- a player wins a game if s/he guesses the secret number before every other player (with fewest number of guesses or in case of even number, in fewest time);
- the game is turn based but the time still matters;
  - in a turn a player can make at most one guess at the server's secret number and the server will respond with clues;
    - a guess is a 4-digit number with unique digits;
    - the response consists of count of "cows" and count of "bulls". A cow is digit that is contained in the secret number but not on the same position as the one in the guess. A bull is a digit that is contained in the secret number on the exact same position as the one in the guess.
  - the turn ends when each player has made their guess or a given timeout has been reached; 
  - all players see all server responses to monitor their opponent's progress. Ofcourse they can see only their own guesses;
- the game ends when each player manages to guess the secret number or the turn limit is reached;

Other details:
- each player can create a new game for a chosen number of competitors or he can join a game that has empty player slots;
- the game starts when all player slots are filled;
- each player chooses a name for other players to recognize him by;

## Implementation details

This project is a client-server application. 
- The server portion is implemented on node.js using the expressjs and socket.io frameworks. Both libraries seem to be the most popular choice of the node.js community. The project requires a web server to serve the client application and a web sockets service for real-time communication with it. express.io package is used as it provides a combined API for expressjs and socket.io.
- The client portion manages the HTML DOM using jQuery library. No framework is used except the client socket.io.
- jasmine testing framework is used. No alternatives were considred. I have used it before and it gets the job done.
