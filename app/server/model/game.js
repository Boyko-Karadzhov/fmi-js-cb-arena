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

var Game = function (options, cowsBulls, endTurnCallback) {
	this._state = Game.states.Waiting;
	this._playerRounds = {};
	this._secret = null;
	this._currentRound = 1;
	this._endTurnCallback = endTurnCallback;

	this._cowsBulls = cowsBulls || cowsBullsModule;
	this._options = extend(clone(defaultOptions), options);
};

Game.prototype = {
	details: function () {
		return {
			state: this._state,
			round: this._currentRound,
			options: this._options,
			players: Object.keys(this._playerRounds),
			winner: this._winner()
		};
	},

	join: function (player) {
		if (this._playerRounds[player] === undefined && this._state === Game.states.Waiting) {
			this._playerRounds[player] = [];
			this._ensureState();
			return true;
		}
		else {
			return false;
		}
	},

	leave: function (player) {
		if (this._playerRounds[player] !== undefined) {
			delete this._playerRounds[player];
			this._ensureState();
			return true;
		}
		else {
			return false;
		}
	},

	ask: function (player, question) {
		if (this._state !== Game.states.Started || !this._cowsBulls.validateQuestion(question))
			return null;

		var rounds = this._playerRounds[player];
		if (rounds === undefined || rounds.length === this._currentRound)
			return null;

		rounds.push({
			time: new Date().getTime(),
			question: question,
			answer: this._cowsBulls.evaluate(this._secret, question)
		});

		this._ensureState();
		return rounds[rounds.length - 1];
	},

	_winner: function () {
		if (this._state !== Game.states.Finished)
			return null;

		var currentWinner = null;
		for (var player in this._playerRounds) {
			if (currentWinner === null || this._playerRounds[player].length < this._playerRounds[currentWinner].length ||
				(this._playerRounds[player].length === this._playerRounds[currentWinner].length &&
					this._lastRoundTime(player) < this._lastRoundTime(currentWinner))) {
				currentWinner = player;
			}
		}

		return currentWinner;
	},

	_lastRoundTime: function (player) {
		var rounds = this._playerRounds[player];
		return rounds[rounds.length - 1].time;
	},

	_setRoundTimeout: function (round) {
		var that = this;
		setTimeout(function () {
			if (round === that._currentRound)
				that._endTurn();
		}, this._options.roundTimeout * 1000);
	},

	_allPlayersAreDone: function () {
		for (var playerName in this._playerRounds) {
			if (this._playerRounds[playerName].length < this._currentRound)
				return false;
		}

		return true;
	},

	_endTurn: function () {
		for (var playerName in this._playerRounds) {
			if (this._playerRounds[playerName].length < this._currentRound)
				this._playerRounds[playerName].push(null);
		}

		this._currentRound = this._currentRound + 1;
		if (this._currentRound > this._options.maxRounds || this._allPlayersGuessedRight()) {
			this._state = Game.states.Finished;
		}

		if (this._state === Game.states.Started)
			this._setRoundTimeout(this._currentRound);

		if (this._endTurnCallback)
			this._endTurnCallback(this.details());
	},

	_allPlayersGuessedRight: function () {
		var rounds, lastRound;
		for (var playerName in this._playerRounds) {
			rounds = this._playerRounds[playerName];
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
	},

	_ensureState: function () {
		var playerNames = Object.keys(this._playerRounds);
		if (this._state === Game.states.Waiting && playerNames.length == this._options.size) {
			this._state = Game.states.Started;
			this._secret = this._cowsBulls.newSecret();
			this._setRoundTimeout(this._currentRound);

			if (this._endTurnCallback)
				this._endTurnCallback(this.details());
		}

		if (playerNames.length === 0) {
			this._state = Game.states.Finished;
		}

		if (this._allPlayersAreDone()) {
			this._endTurn();
		}

		if (this._currentRound > this._options.maxRounds || this._allPlayersGuessedRight()) {
			this._state = Game.states.Finished;
		}
	}
};

Game.prototype.constructor = Game;

Game.states = {
	Waiting: 'waiting',
	Started: 'started',
	Finished: 'finished'
};

module.exports = Game;