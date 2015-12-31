'use strict';

var lobby = require('./model').lobby;
var Controller = function () {
    this._activeSessions = {};
};

Controller.prototype = {
    signIn: function (req) {
        var result = lobby.signIn(req.data);
        if (result) {
            this._activeSessions[req.data] = req.io;
            req.io.emit('sign-in-success', result.code);
        }
        else {
            req.io.emit('sign-in-fail');
        }
    }
};

Controller.prototype.constructor = Controller;

module.exports = Controller;