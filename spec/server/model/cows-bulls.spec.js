var cowsBulls = require('../../../app/server/model/cows-bulls');

describe('Cows & Bulls', function() {
	it('should generate a four digit secret', function () {
		var secret = cowsBulls.newSecret();
		expect(secret.length).toBe(4);
	});

	it('should evaluate questions correctly', function () {
		var secret, question, result;

		secret = ['1', '2', '3', '4'];
		question  = ['1', '2', '3', '4'];
		result = cowsBulls.evaluate(secret, question);
		expect(result.cows).toBe(0);
		expect(result.bulls).toBe(4);

		secret = ['1', '2', '3', '4'];
		question  = ['5', '6', '7', '8'];
		result = cowsBulls.evaluate(secret, question);
		expect(result.cows).toBe(0);
		expect(result.bulls).toBe(0);

		secret = ['1', '2', '3', '4'];
		question  = ['1', '3', '2', '4'];
		result = cowsBulls.evaluate(secret, question);
		expect(result.cows).toBe(2);
		expect(result.bulls).toBe(2);
	});
});