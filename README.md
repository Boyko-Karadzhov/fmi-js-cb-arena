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

## Implementation details

This project is a client-server application. 
- The server portion is implemented on node.js using the expressjs and socket.io frameworks. Both libraries seem to be the most popular choice of the node.js community. The project requires a web server to serve the client application and a web sockets service for real-time communication with it. express.io package is used as it provides a combined API for expressjs and socket.io.
- The client portion manages the HTML DOM using jQuery library. No framework is used except the client socket.io.
- jasmine testing framework is used. No alternatives were considred. I have used it before and it gets the job done.
