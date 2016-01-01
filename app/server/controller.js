'use strict';

var lobby = require('./model').lobby;
var Controller = function () {
    this._activeSessions = {};
};

Controller.prototype = {
    signIn: function (req) {
        if (!req.data || !req.data.trim())
            return;

        var name = req.data.trim();
        var result = lobby.signIn(name);
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
            req.io.emit('lobby-game-list', lobby.gameList());
        }
        else {
            this._failSignIn(req);
        }
    },

    signOut: function (req) {
        if (this._validate(req.data)) {
            lobby.signOut(req.data.name);
        }
    },

    newGame: function (req) {
        if (!req.data || !req.data.options)
            return;

        if (this._validate(req.data.ticket)) {
            req.io.emit('new-game', lobby.newGame(req.data.options));
        }
        else {
            this._failSignIn(req);
        }
    },

    _validate: function (ticket) {
        if (!ticket || !ticket.name || !ticket.code)
            return false;

        return lobby.validatePlayer(ticket.name, ticket.code);
    },

    _failSignIn: function (req) {
        req.io.emit('sign-in-fail');
    }
};

Controller.prototype.constructor = Controller;

module.exports = Controller;