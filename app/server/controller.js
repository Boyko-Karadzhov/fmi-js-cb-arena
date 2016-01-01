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
    },

    newGame: function (req) {
        if (!req.data || !req.data.options)
            return;

        if (this._validate(req.data.ticket)) {
            var options = req.data.options;
            if (options.name && options.name.trim() && options.size >= 1 && options.maxRounds >= 1 && options.roundTimeout >= 10 && options.roundTimeout <= 590) {
                options.name = options.name.trim();
                if (this._lobby.newGame(options)) {
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
        if (!req.data || !req.data.game)
            return;

        if (this._validate(req.data.ticket)) {
            if (this._lobby.join(req.data.ticket.name, req.data.game)) {
                req.io.emit('join', req.data.game);
            }
            else {
                // TODO: handle this
            }
        }
        else {
            this._failSignIn(req);
        }
    },

    _validate: function (ticket) {
        if (!ticket || !ticket.name || !ticket.code)
            return false;

        return this._lobby.validatePlayer(ticket.name, ticket.code);
    },

    _failSignIn: function (req) {
        req.io.emit('sign-in-fail');
    },

    _broadcastGameList: function () {
        var that = this;
        Object.keys(this._activeSessions).forEach(function (name) {
            that._activeSessions[name].emit('lobby-game-list', that._lobby.gameList());
        });
    }
};

Controller.prototype.constructor = Controller;

module.exports = Controller;