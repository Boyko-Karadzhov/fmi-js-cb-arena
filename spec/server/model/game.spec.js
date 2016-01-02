var Game = require('../../../app/server/model/game');
var cowsBulls = require('../../../app/server/model/cows-bulls');
var clone = require('clone');

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

	it('should return false when asked on a non-started game', function() {
		var player = 'my man';
		var game = new Game({name: 'some name', size: 2});
		game.join(player);
		expect(game.ask(player, ['1', '2', '3', '4'])).toBe(null);
	});

	it('should return false when asked out of order', function() {
		var player1 = 'my man';
		var player2 = 'other man';
		var question = ['1', '2', '3', '4'];
		var game = new Game({name: 'some name', size: 2});
		game.join(player1);
		game.join(player2);
		game.ask(player1, question);
		expect(game.ask(player1, question)).toBe(null);
	});

	it('should return true when asked correctly', function() {
		var player1 = 'my man';
		var question = ['1', '2', '3', '4'];
		var game = new Game({name: 'some name', size: 1});
		game.join(player1);
		expect(game.ask(player1, question)).not.toBe(null);
	});

	it('should proceed to next turn when all players are done asking', function () {
		var player1 = 'my man';
		var player2 = 'other man';
		var question = ['1', '2', '3', '4'];
		var game = new Game({name: 'some name', size: 2});
		game.join(player1);
		game.join(player2);
		game.ask(player1, question);
		game.ask(player2, question);
		expect(game.details().round).toBe(2);
	});

	it('should finish when rounds are over the max', function () {
		var player1 = 'my man';
		var question = ['1', '2', '3', '4'];
		var game = new Game({name: 'some name', maxRounds: 1});
		game.join(player1);
		game.ask(player1, question);
		expect(game.details().state).toBe(Game.states.Finished);
	});

	it('should finish when all players guess the secret', function () {
		var player1 = 'my man';
		var player2 = 'other man';
		var question = ['1', '2', '3', '4'];
		var cowsBullsMock = clone(cowsBulls);
		cowsBullsMock.newSecret = function () { return question; };
		var game = new Game({name: 'some name', size: 2}, cowsBullsMock);
		game.join(player1);
		game.join(player2);
		game.ask(player1, question);
		game.ask(player2, question);
		expect(game.details().state).toBe(Game.states.Finished);
	});

	it('should return null for winner while game is not finished', function () {
		var game = new Game({name: 'some name', size: 1});
		game.join('my player');
		expect(game.details().winner).toBe(null);
	});

	it('should return for winner the player which got the answer first', function () {
		var player1 = 'my man';
		var player2 = 'other man';
		var question = ['1', '2', '3', '4'];
		var cowsBullsMock = clone(cowsBulls);
		cowsBullsMock.newSecret = function () { return question; };
		var game = new Game({name: 'some name', size: 2}, cowsBullsMock);
		game.join(player1);
		game.join(player2);
		game.ask(player1, ['0', '1', '2', '3']);
		game.ask(player2, question);
		game.ask(player1, question);
		expect(game.details().winner).toBe(player2);
	});
});