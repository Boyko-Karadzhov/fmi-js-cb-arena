'use strict';

var lobby = require('./model').lobby;
var Controller = function () {
    this._activeSessions = {};
};

Controller.prototype = {
    signIn: function (req) {
        if (!req.data)
            return;

        var result = lobby.signIn(req.data);
        if (result) {
            this._activeSessions[req.data] = req.io;
            req.io.emit('sign-in-success', { name: req.data, code: result.code });
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