'use strict';

function Game(name) {
	var state = Game.states.Waiting;

	this.get_state = function () {
		return state;
	};

	this.get_name = function () {
		return name;
	};
};

Game.states = {
	Waiting: 'waiting',
	Started: 'started',
	Finished: 'finished'
};

module.exports = Game;