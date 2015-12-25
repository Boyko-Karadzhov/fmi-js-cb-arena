var Game = require('../../../app/server/model/game');

describe('Game', function () {
	it('should initiate with "Waiting" state', function () {
		var game = new Game('some name');
		expect(game.get_state()).toBe(Game.states.Waiting);
	});
});