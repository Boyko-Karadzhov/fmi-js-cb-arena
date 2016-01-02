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
});