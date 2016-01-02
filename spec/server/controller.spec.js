var Controller = require('../../app/server/controller');
var Lobby = require('../../app/server/model/lobby');

var RequestMock = function (data) {
    this.emitted = [];

    this.data = data;
    var that = this;
    this.io = {
        emit: function (name, data) {
            that.emitted.push({ name: name, data: data });
        }
    };
};

describe('Controller', function () {
    Object.keys(Controller.prototype).forEach(function (prop) {
        if (!prop.startsWith('_') && typeof Controller.prototype[prop] === 'function' && prop !== 'constructor' && prop !== 'signIn') {
            it('should emit sign in fail on invalid ticket at ' + prop, function () {
                var lobby = new Lobby();
                var controller = new Controller(lobby);
                var req = new RequestMock({ ticket: null });
                controller[prop](req);

                expect(req.emitted.length).toBe(1);
                expect(req.emitted[0].name).toBe('sign-in-fail');
            });
        }
    });

    it('should emit ticket on sign in', function () {
        var lobby = new Lobby();
        var controller = new Controller(lobby);
        var player = 'my man';
        var req = new RequestMock(player);
        controller.signIn(req);

        expect(req.emitted.length).toBe(1);
        expect(req.emitted[0].name).toBe('sign-in-success');
        expect(req.emitted[0].data).not.toBe(null);
        expect(req.emitted[0].data.code).not.toBe(null);
        expect(req.emitted[0].data.name).toBe(player);
    });

    it('should emit game list on lobbyGameList', function () {
        var gameList = 'mah list';
        var lobby = new Lobby();
        lobby.gameList = function () { return gameList; };

        var controller = new Controller(lobby);
        controller._validate = function() { return true; };
        var req = new RequestMock(null);
        controller.lobbyGameList(req);

        expect(req.emitted.length).toBe(1);
        expect(req.emitted[0].name).toBe('lobby-game-list');
        expect(req.emitted[0].data).toBe(gameList);
    });

    it('should emit join on newGame if it\'s successful', function () {
        var game = 'mah game';
        var player = 'my man';
        var lobby = new Lobby();
        var controller = new Controller(lobby);
        controller._validate = function() { return true; };
        var req = new RequestMock({ ticket: { name: player }, options: { name: game, size: 1, maxRounds: 20, roundTimeout: 100 } });
        controller.newGame(req);

        expect(req.emitted.length).toBe(1);
        expect(req.emitted[0].name).toBe('join');
        expect(req.emitted[0].data).toBe(game);
    });

    it('should emit game list on newGame if it\'s successful', function () {
        var game = 'mah game';
        var player1 = 'my man';
        var player2 = 'other man';
        var gameList = 'mah list';
        var lobby = new Lobby();
        lobby.gameList = function () { return gameList; };

        var controller = new Controller(lobby);
        controller._validate = function() { return true; };

        var req1 = new RequestMock(player1);
        controller.signIn(req1);
        var req2 = new RequestMock({ ticket: { name: player2 }, options: { name: game, size: 1, maxRounds: 20, roundTimeout: 100 } });
        controller.newGame(req2);

        expect(req1.emitted.length).toBe(2);
        expect(req1.emitted[1].name).toBe('lobby-game-list');
        expect(req1.emitted[1].data).toBe(gameList);
    });

    it('should emit new-game-fail on newGame if it\'s invalid', function () {
        var game = 'mah game';
        var player = 'my man';
        var lobby = new Lobby();
        var controller = new Controller(lobby);
        controller._validate = function() { return true; };
        var req = new RequestMock({ ticket: { name: player }, options: { name: game, size: 0, maxRounds: 20, roundTimeout: 100 } });
        controller.newGame(req);

        expect(req.emitted.length).toBe(1);
        expect(req.emitted[0].name).toBe('new-game-fail');
    });

    it('should emit join on successful join', function () {
        var game = 'mah game';
        var player = 'my man';
        var lobby = new Lobby();
        lobby.join = function () { return true; };
        var controller = new Controller(lobby);
        controller._validate = function() { return true; };
        var req = new RequestMock({ ticket: { name: player }, game: game });
        controller.join(req);

        expect(req.emitted.length).toBe(1);
        expect(req.emitted[0].name).toBe('join');
        expect(req.emitted[0].data).toBe(game);
    });

    it('should emit lobby-fail on unsuccessful join', function () {
        var game = 'mah game';
        var player = 'my man';
        var lobby = new Lobby();
        lobby.join = function () { return false; };
        var controller = new Controller(lobby);
        controller._validate = function() { return true; };
        var req = new RequestMock({ ticket: { name: player }, game: game });
        controller.join(req);

        expect(req.emitted.length).toBe(1);
        expect(req.emitted[0].name).toBe('lobby-fail');
    });

    it('should emit game-details on valid gameDetails', function () {
        var game = 'mah game';
        var details = 'game details';
        var lobby = new Lobby();
        lobby.gameDetails = function () { return details; };
        var controller = new Controller(lobby);
        controller._validate = function() { return true; };
        var req = new RequestMock({ game: game });
        controller.gameDetails(req);

        expect(req.emitted.length).toBe(1);
        expect(req.emitted[0].name).toBe('game-details');
        expect(req.emitted[0].data).toBe(details);
    });

    it('should emit lobby-fail on invalid gameDetails', function () {
        var game = 'mah game';
        var lobby = new Lobby();
        lobby.gameDetails = function () { return null; };
        var controller = new Controller(lobby);
        controller._validate = function() { return true; };
        var req = new RequestMock({ game: game });
        controller.gameDetails(req);

        expect(req.emitted.length).toBe(1);
        expect(req.emitted[0].name).toBe('lobby-fail');
    });
});