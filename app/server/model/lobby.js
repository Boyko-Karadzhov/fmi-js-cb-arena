'use strict';

var uuid = require('node-uuid');
var Game = require('./game');

function Lobby() {
	var playerActivityTimeout = 10 * 60 * 1000,
		games = {},
		players = {};

	var resetPlayerTimeout = function (player) {
		if (players[player] === undefined)
			return;

		if (players[player].timeoutId)
			clearTimeout(players[player].timeoutId);

		var that = this;
		var timeoutId = setTimeout(function () {
			that.signOut(player);
		}, playerActivityTimeout);
		players[player].timeoutId = timeoutId;
	};

	var ensureGame = function (game) {
		if (games[game] !== undefined && games[game].details().state === Game.states.Finished) {
			delete games[game];
		}
	};

	this.newGame = function (options) {
		if (options.name !== undefined && options.name !== null && games[options.name] === undefined) {
			games[options.name] = new Game(options);
			return true;
		}
		else {
			return false;
		}
	};

	this.gameList = function () {
		var list = [];
		for (var name in games) {
			if (games[name].details().state === Game.states.Waiting) {
				list.push(name);
			}
		}

		return list;
	};

	this.playerList = function () {
		return Object.keys(players);
	};

	this.signIn = function (name) {
		if (players[name] === undefined) {
			players[name] = {
				timeoutId: null,
				code: uuid.v4()
			};
			resetPlayerTimeout(name);
			return true;
		}
		else {
			return false;
		}
	};

	this.signOut = function (name) {
		if (players[name] !== undefined) {
			for (var game in games)
				games[game].leave(name);

			delete players[name];
		}
	};

	this.validatePlayer = function (name, code) {
		if (players[name] !== undefined) {
			if (players[name] === code) {
				resetPlayerTimeout(name);
				return true;
			}
		}

		return false;
	};

	this.join = function (player, game) {
		return games[game] !== undefined && games[game].join(player);
	};

	this.leave = function (player, game) {
		var result = games[game] !== undefined && games[game].leave(player);
		ensureGame(game);
		return result;
	};

	this.ask = function (player, game, question) {
		if (games[game] === undefined)
			return null;

		var result = games[game].ask(player, question);
		ensureGame(game);
		return result;
	};

	this.gameDetails = function (game) {
		if (games[game] !== undefined)
			return games[game].details();
		else
			return null;
	};
};

module.exports = Lobby;