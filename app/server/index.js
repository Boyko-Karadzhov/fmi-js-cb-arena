var express = require('express.io'),
	path = require('path'),
	Controller = require('./controller');

var app = express();
app.http().io();

var clientPath = path.resolve('app\\client\\');
app.use(express.static(clientPath));
app.get('/', function(req, res) {
	res.sendfile(clientPath + 'index.html');
});

app.io.route('sign-in', function (req) {

});

console.log('Cows & Bulls Arena: Listening at 7076...');
app.listen(7076);