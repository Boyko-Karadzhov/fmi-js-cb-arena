var express = require('express.io'),
	path = require('path'),
	Controller = require('./controller'),
	decamelize = require('decamelize');

var app = express();
var controller = new Controller();
app.http().io();

var clientPath = path.resolve('app\\client\\');
app.use(express.static(clientPath));
app.get('/', function(req, res) {
	res.sendfile(clientPath + 'index.html');
});

Object.keys(Controller.prototype).forEach(function (prop) {
	if (!prop.startsWith('_') && typeof controller[prop] === 'function' && prop !== 'constructor') {
		var routePattern = decamelize(prop, '-');
		(function (action) {
			app.io.route(routePattern, function (req) {
				controller[action](req);
			});
		})(prop);
	}
});

console.log('Cows & Bulls Arena: Listening at 7076...');
app.listen(7076);