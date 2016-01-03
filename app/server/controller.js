'use strict';

var model = require('./model');
var Controller = function (lobby) {
    this._activeSessions = {};
    this._lobby = lobby || model.lobby;
};

Controller.prototype = {
    signIn: function (req) {
        if (!req.data || !req.data.trim())
            return;

        var name = req.data.trim();
        var result = this._lobby.signIn(name);
        if (result) {
            this._activeSessions[name] = req.io;
            req.io.emit('sign-in-success', { name: name, code: result.code });
        }
        else {
            this._failSignIn(req);
        }
    },

    lobbyGameList: function (req) {
        if (this._validate(req.data)) {
            req.io.emit('lobby-game-list', this._lobby.gameList());
        }
        else {
            this._failSignIn(req);
        }
    },

    signOut: function (req) {
        if (this._validate(req.data)) {
            this._lobby.signOut(req.data.name);
            if (this._activeSessions[req.data.nane])
                delete this._activeSessions[req.data.name];
        }
        else {
            this._failSignIn(req);
        }
    },

    newGame: function (req) {
        if (this._validate(req.data)) {
            if (!req.data.options)
                return;

            var options = req.data.options;
            if (options.name && options.name.trim() && options.size >= 1 && options.maxRounds >= 1 && options.roundTimeout >= 10 && options.roundTimeout <= 590) {
                options.name = options.name.trim();
                if (this._lobby.newGame(options, this._endTurnCallback.bind(this))) {
                    req.data.game = options.name;
                    this._broadcastGameList();
                    this.join(req);
                }
                else {
                    req.io.emit('new-game-fail', "Please choose another name for the game. '" + options.name + "' is taken.");
                }
            }
            else {
                req.io.emit('new-game-fail', "You have tried to create a game with some invalid options.");
            }
        }
        else {
            this._failSignIn(req);
        }
    },

    join: function (req) {
        if (this._validate(req.data)) {
            if (!req.data.game)
                return;

            if (this._lobby.join(req.data.ticket.name, req.data.game)) {
                req.io.emit('join', req.data.game);
                this._broadcastGameDetails(req.data.game);
            }
            else {
                req.io.emit('lobby-fail', 'Could not join "' + req.data.name + '".');
            }
        }
        else {
            this._failSignIn(req);
        }
    },

    gameDetails: function (req) {
        if (this._validate(req.data)) {
            if (!req.data.game)
                return;

            var details = this._lobby.gameDetails(req.data.game);
            if (details) {
                req.io.emit('game-details', details);
            }
            else {
                req.io.emit('lobby-fail', 'Could not get details of "' + req.data.game + '".');
            }
        }
        else {
            this._failSignIn(req);
        }
    },

    leave: function (req) {
        if (this._validate(req.data)) {
            if (!req.data.game)
                return;

            if (this._lobby.leave(req.data.ticket.name, req.data.game)) {
                this._broadcastGameDetails(req.data.game);
            }
        }
        else {
            this._failSignIn(req);
        }
    },

    ask: function (req) {
        if (this._validate(req.data)) {
            if (!req.data.game || !req.data.question)
                return;

            var round = this._lobby.gameDetails(req.data.game).round;
            var result = this._lobby.ask(req.data.ticket.name, req.data.game, req.data.question.split(''));
            if (result) {
                result.question = result.question.join('');
                req.io.emit('answer', {
                    player: req.data.ticket.name,
                    game: req.data.game,
                    result: result, round: round
                });

                this._broadcastGameDetails(req.data.game);
            }
        }
        else {
            this._failSignIn(req);
        }
    },

    _validate: function (data) {
        if (!data || !data.ticket || !data.ticket.name || !data.ticket.code)
            return false;

        return this._lobby.validatePlayer(data.ticket.name, data.ticket.code);
    },

    _failSignIn: function (req) {
        req.io.emit('sign-in-fail');
    },

    _broadcastGameList: function () {
        var that = this;
        Object.keys(this._activeSessions).forEach(function (name) {
            that._activeSessions[name].emit('lobby-game-list', that._lobby.gameList());
        });
    },

    _broadcastGameDetails: function (game) {
        var details = this._lobby.gameDetails(game);
        var that = this;
        if (details) {
            details.players.forEach(function (val) {
                if (that._activeSessions[val]) {
                    that._activeSessions[val].emit('game-details', details);
                }
            });
        }
    },

    _endTurnCallback: function (details) {
        this._broadcastGameDetails(details.options.name);
    }
};

Controller.prototype.constructor = Controller;

module.exports = Controller;