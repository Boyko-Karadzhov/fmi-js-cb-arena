var express = require('express.io'),
	path = require('path'),
	Controller = require('./app/server/controller');

var app = express();
app.http().io();

var clientPath = path.resolve('app/client/');
app.use(express.static(clientPath));
app.get('/', function(req, res) {
	res.sendfile(clientPath + 'index.html');
});

console.log('Listening at 7076...');
app.listen(7076);