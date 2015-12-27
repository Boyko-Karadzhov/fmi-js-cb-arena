'use strict';

var cowsBullsModule = require('./cows-bulls');
var extend = require('extend');
var clone = require('clone');

/*
	Options:
		name: Name of the game.
		size: Size of the game. The number of players in it.
		maxRounds: Maximum number of rounds. Game ends when reached.
		roundTimeout: Maximum amount of time on a round in seconds. Game proceeds to next round after timeout.
*/
var defaultOptions = {
	name: null,
	size: 1,
	maxRounds: 20,
	roundTimeout: 2 * 60
};

function Game(options, cowsBulls) {
	var state = Game.states.Waiting,
		playerRounds = {},
		secret = null,
		currentRound = 1;

	cowsBulls = cowsBulls || cowsBullsModule;
	options = extend(clone(defaultOptions), options);

	var setRoundTimeout = function (round) {
		setTimeout(function () {
			if (round === currentRound)
				endTurn();
		}, options.roundTimeout * 1000);
	};

	var allPlayersAreDone = function () {
		for (var playerName in playerRounds) {
			if (playerRounds[playerName].length < currentRound)
				return false;
		}

		return true;
	};

	var endTurn = function () {
		for (var playerName in playerRounds) {
			if (playerRounds[playerName].length < currentRound)
				playerRounds[playerName].push(null);
		}

		currentRound = currentRound + 1;
		setRoundTimeout(currentRound);
	};

	var allPlayersGuessedRight = function () {
		var rounds, lastRound;
		for (var playerName in playerRounds) {
			rounds = playerRounds[playerName];
			if (rounds.length > 0) {
				lastRound = rounds[rounds.length - 1];
				if (lastRound === null || lastRound.answer.bulls < 4)
					return false;
			}
			else {
				return false;
			}
		}

		return true;
	};

	var ensureState = function () {
		var playerNames = Object.keys(playerRounds);
		if (state === Game.states.Waiting && playerNames.length === options.size) {
			state = Game.states.Started;
			secret = cowsBulls.newSecret();
			setRoundTimeout(currentRound);
		}

		if (playerNames.length === 0) {
			state = Game.states.Finished;
		}

		if (allPlayersAreDone()) {
			endTurn();
		}

		if (currentRound > options.maxRounds || allPlayersGuessedRight()) {
			state = Game.states.Finished;
		}
	};

	this.details = function () {
		return {
			state: state,
			round: currentRound,
			options: options,
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
		if (state !== Game.states.Started || !cowsBulls.validateQuestion(question))
			return null;

		var rounds = playerRounds[player];
		if (rounds === undefined || rounds.length === currentRound)
			return null;

		rounds.push({
			time: new Date().getTime(),
			question: question,
			answer: cowsBulls.evaluate(secret, question)
		});

		ensureState();
		return rounds[rounds.length - 1];
	};
};

Game.states = {
	Waiting: 'waiting',
	Started: 'started',
	Finished: 'finished'
};

module.exports = Game;