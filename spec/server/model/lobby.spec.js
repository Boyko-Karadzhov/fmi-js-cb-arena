var Lobby = require('../../../app/server/model/lobby');

describe('Lobby', function () {
	it('should return list of games', function () {
		var name = 'game name';
		var lobby = new Lobby();
		lobby.newGame(name);
		var result = lobby.gameList();

		expect(result).toEqual(jasmine.any(Array));
		expect(result.length).toBe(1);
		expect(result[0]).toBe(name);
	});

	it('should return true for a unique newGame', function () {
		var name = 'game name';
		var lobby = new Lobby();
		expect(lobby.newGame(name)).toBe(true);
	});

	it('should return false for a non-unique newGame', function () {
		var name = 'game name';
		var lobby = new Lobby();
		lobby.newGame(name);
		expect(lobby.newGame(name)).toBe(false);
	});

	it('should return list of players', function () {
		var name = 'my player';
		var lobby = new Lobby();
		lobby.signIn(name);
		var result = lobby.playerList();

		expect(result).toEqual(jasmine.any(Array));
		expect(result.length).toBe(1);
		expect(result[0]).toBe(name);
	});

	it('should return true for a unique player signIn', function () {
		var lobby = new Lobby();
		expect(lobby.signIn('my player')).toBe(true);
	});

	it('should return false for a non-unique player signIn', function () {
		var name = 'my player';
		var lobby = new Lobby();
		lobby.signIn(name);
		expect(lobby.signIn(name)).toBe(false);
	});
});