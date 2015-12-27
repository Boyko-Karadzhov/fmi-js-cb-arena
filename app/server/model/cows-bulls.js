'use strict';

var clone = require('clone');
var allowedSymbols = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

module.exports = {
	newSecret: function () {
		var ticket,
			digits = clone(allowedSymbols);

		var secret = [];
		for (var i = 0; i < 4; i++) {
			ticket = Math.floor(Math.random() * digits.length);
			secret.push(digits[i]);
			digits.splice(ticket, 1);
		}

		return secret;
	},

	evaluate: function(secret, question) {
		var result = { bulls: 0, cows: 0 };
		for (var i = 0; i < question.length; i++) {
			if (i < secret.length && secret[i] === question[i])
				result.bulls = result.bulls + 1;
			else if (question[i] in secret)
				result.cows = result.cows + 1;
		}

		return result;
	},

	validateQuestion: function(question) {
		if (!Array.isArray(question) || question.length !== 4)
			return false;

		if (!question.every(function (c) { return c in allowedSymbols; }))
			return false;

		var temp = clone(question);
		var currentChar;
		while (temp.length > 0) {
			currentChar = temp.splice(0, 1)[0];
			if (temp.indexOf(currentChar) > -1)
				return false;
		}

		return true;
	}
};