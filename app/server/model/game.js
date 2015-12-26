'use strict';

var cowsBulls = require('./cows-bulls');

/*
 Options:
   name: Name of the game.
   size: Size of the game. The number of players in it.
*/
function Game(options) {
	var state = Game.states.Waiting,
		playerRounds = {},
		secret = null;

	var ensureState = function () {
		var playerCount = Object.keys(playerRounds).length;
		if (playerCount === options.size) {
			state = Game.states.Started;
			secret = cowsBulls.newSecret();
		}
		else if (playerCount === 0) {
			state = Game.states.Finished;
		}
	};

	this.details = function () {
		return {
			state: state,
			name: options.name,
			players: Object.keys(playerRounds)
		};
	};

	this.join = function (player) {
		if (playerRounds[player] === undefined && state === Game.states.Waiting) {
			playerRounds[player] = [];
			ensureState();
			return true;
		}
		else {
			return false;
		}
	};

	this.leave = function (player) {
		if (playerRounds[player] !== undefined) {
			delete playerRounds[player];
			ensureState();
			return true;
		}
		else {
			return false;
		}
	};

	this.ask = function (player, question) {
		
	};
};

Game.states = {
	Waiting: 'waiting',
	Started: 'started',
	Finished: 'finished'
};

module.exports = Game;