'use strict';

module.exports = {
	newSecret: function () {
		var ticket,
			digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

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
	}
};