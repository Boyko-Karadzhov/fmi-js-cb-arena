var Game = require('../../../app/server/model/game');

describe('Game', function () {
	it('should initiate with "Waiting" state', function () {
		var game = new Game({name: 'some name'});
		expect(game.details().state).toBe(Game.states.Waiting);
	});

	it('should be Started when game is full', function () {
		var game = new Game({name: 'some name', size: 1});
		game.join('my player');
		expect(game.details().state).toBe(Game.states.Started);
	});

	it('should return true on player join', function () {
		var game = new Game({name: 'some name', size: 1});
		expect(game.join('my player')).toBe(true);
	});

	it('should return false on non-unique player join', function () {
		var name = 'my player';
		var game = new Game({name: 'some name', size: 3});
		game.join(name);
		expect(game.join(name)).toBe(false);
	});

	it('should return false on full game player join', function () {
		var game = new Game({name: 'some name', size: 1});
		game.join('player1');
		expect(game.join('player2')).toBe(false);
	});

	it('should remove player on leave', function () {
		var name = 'my player';
		var game = new Game({name: 'some name', size: 1});
		game.leave(name);
		expect(game.details().players.length).toBe(0);
	});
});