'use strict';

var uuid = require('node-uuid');
var Game = require('./game');

var Lobby = function () {
	this._playerActivityTimeout = 10 * 60 * 1000;
	this._games = {};
	this._players = {};
};

Lobby.prototype = {
	newGame: function (options) {
		if (options.name !== undefined && options.name !== null && this._games[options.name] === undefined) {
			this._games[options.name] = new Game(options);
			return true;
		}
		else {
			return false;
		}
	},

	gameList: function () {
		var list = [];
		for (var name in this._games) {
			if (this._games[name].details().state === Game.states.Waiting) {
				list.push(name);
			}
		}

		return list;
	},

	playerList: function () {
		return Object.keys(this._players);
	},

	signIn: function (name) {
		if (this._players[name] === undefined) {
			this._players[name] = {
				timeoutId: null,
				code: uuid.v4()
			};
			this._resetPlayerTimeout(name);
			return this._players[name];
		}
		else {
			return null;
		}
	},

	signOut: function (name) {
		if (this._players[name] !== undefined) {
			for (var game in this._games)
				this._games[game].leave(name);

			delete this._players[name];
		}
	},

	validatePlayer: function (name, code) {
		if (this._players[name] !== undefined) {
			if (this._players[name].code === code) {
				this._resetPlayerTimeout(name);
				return true;
			}
		}

		return false;
	},

	join: function (player, game) {
		return this._games[game] !== undefined && this._games[game].join(player);
	},

	leave: function (player, game) {
		var result = this._games[game] !== undefined && this._games[game].leave(player);
		this._ensureGame(game);
		return result;
	},

	ask: function (player, game, question) {
		if (this._games[game] === undefined)
			return null;

		var result = this._games[game].ask(player, question);
		this._ensureGame(game);
		return result;
	},

	gameDetails: function (game) {
		if (this._games[game] !== undefined)
			return this._games[game].details();
		else
			return null;
	},

	_resetPlayerTimeout: function (player) {
		if (this._players[player] === undefined)
			return;

		if (this._players[player].timeoutId)
			clearTimeout(this._players[player].timeoutId);

		var that = this;
		var timeoutId = setTimeout(function (lobby) {
			that.signOut(player);
		}, this._playerActivityTimeout);

		this._players[player].timeoutId = timeoutId;
	},

	_ensureGame: function (game) {
		if (this._games[game] !== undefined && this._games[game].details().state === Game.states.Finished) {
			delete this._games[game];
		}
	}
};

Lobby.prototype.constructor = Lobby;

module.exports = Lobby;