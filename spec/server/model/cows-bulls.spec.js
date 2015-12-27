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

	it('should return true for a valid question', function () {
		expect(cowsBulls.validateQuestion(['1', '2', '3', '4'])).toBe(true);
	});

	it('should return false for non-array question', function() {
		expect(cowsBulls.validateQuestion('I are question')).toBe(false);
	});

	it('should return false for question with repeating digits', function() {
		expect(cowsBulls.validateQuestion(['1', '2', '3', '3'])).toBe(false);
	});

	it('should return false for question with wrong size', function() {
		expect(cowsBulls.validateQuestion(['1'])).toBe(false);
	});
});