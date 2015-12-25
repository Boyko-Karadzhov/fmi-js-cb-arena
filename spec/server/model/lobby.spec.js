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

	it('should return true for unique newGame', function () {
		var name = 'game name';
		var lobby = new Lobby();
		expect(lobby.newGame(name)).toBe(true);
	});

	it('should return false for non-unique newGame', function () {
		var name = 'game name';
		var lobby = new Lobby();
		lobby.newGame(name);
		expect(lobby.newGame(name)).toBe(false);
	});
});