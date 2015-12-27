var Lobby = require('../../../app/server/model/lobby');

describe('Lobby', function () {
	it('should return list of games', function () {
		var name = 'game name';
		var lobby = new Lobby();
		lobby.newGame({name: name});
		var result = lobby.gameList();

		expect(result).toEqual(jasmine.any(Array));
		expect(result.length).toBe(1);
		expect(result[0]).toBe(name);
	});

	it('should return true for a unique newGame', function () {
		var name = 'game name';
		var lobby = new Lobby();
		expect(lobby.newGame({name: name})).toBe(true);
	});

	it('should return false for a non-unique newGame', function () {
		var name = 'game name';
		var lobby = new Lobby();
		lobby.newGame({name: name});
		expect(lobby.newGame({name: name})).toBe(false);
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

	it('should remove player from list on signOut', function () {
		var name = 'my player';
		var lobby = new Lobby();
		lobby.signIn(name);
		lobby.signOut(name);
		expect(lobby.playerList().length).toBe(0);
	});

	it('should add a player to a game on join', function () {
		var playerName = 'my man';
		var gameName = 'my game';
		var lobby = new Lobby();
		lobby.newGame({name: gameName});
		lobby.join(playerName, gameName);
		var details = lobby.gameDetails(gameName);
		expect(details.players.length).toBe(1);
		expect(details.players[0]).toBe(playerName);
	});

	it('should remove a player from a game on leave', function () {
		var player1 = 'my man', player2 = 'other man';
		var gameName = 'my game';
		var lobby = new Lobby();
		lobby.newGame({name: gameName, size: 2});
		lobby.join(player1, gameName);
		lobby.join(player2, gameName);
		lobby.leave(player1, gameName);
		var details = lobby.gameDetails(gameName);
		expect(details.players.length).toBe(1);
		expect(details.players[0]).toBe(player2);
	});

	it('should remove the game when all players are gone', function () {
		var player1 = 'my man', player2 = 'other man';
		var gameName = 'my game';
		var lobby = new Lobby();
		lobby.newGame({name: gameName, size: 2});
		lobby.join(player1, gameName);
		lobby.join(player2, gameName);
		lobby.leave(player1, gameName);
		lobby.leave(player2, gameName);
		var result = lobby.gameList();
		expect(result.length).toBe(0);
	});

	it('should leave all games on signOut', function () {
		var player1 = 'my man', player2 = 'other man';
		var gameName = 'my game';
		var lobby = new Lobby();
		lobby.signIn(player1);
		lobby.newGame({name: gameName, size: 2});
		lobby.join(player1, gameName);
		lobby.join(player2, gameName);
		lobby.signOut(player1);
		var details = lobby.gameDetails(gameName);
		expect(details.players.length).toBe(1);
		expect(details.players[0]).toBe(player2);
	});
});