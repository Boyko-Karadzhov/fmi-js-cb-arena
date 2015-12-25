'use strict';

var Game = require('./game');

function Lobby() {
	var games = {};

	this.newGame = function (name) {
		if (games[name] === undefined) {
			games[name] = new Game(name);
			return true;
		}
		else {
			return false;
		}
	};

	this.gameList = function () {
		var list = [];
		for (var name in games) {
			if (games[name].get_state() === Game.states.Waiting) {
				list.push(name);
			}
		}

		return list;
	};
};

module.exports = Lobby;