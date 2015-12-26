'use strict';

var uuid = require('node-uuid');
var Game = require('./game');

function Lobby() {
	var games = {};
	var players = {};

	this.newGame = function (name) {
		if (games[name] === undefined) {
			games[name] = new Game({name: name});
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
			players[name] = uuid.v1();
			return true;
		}
		else {
			return false;
		}
	};
};

module.exports = Lobby;