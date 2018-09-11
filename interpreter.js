const scanner = require('./frontend/scanning/scanner');

const reader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

function error (line, message) {
	console.log(`[line ${line}] Error: ${message}`);
}

if (process.argv.length > 3) {
	console.log('usage: node interpreter.js [lit file]');
	process.exit(64);
}

if (process.argv.length === 3) {
	const fs = require('fs');

	const tokens = scanner(fs.readFileSync(process.argv[2]).toString());
	const error = printTokens(tokens);
	process.exit(error ? 1 : 0);
} else {
	console.log('Welcome to Lit V -99\n');
	(function interpret () {
		reader.question('> ', (input) => {
			const tokens = scanner(input);
			printTokens(tokens);
			interpret();
		});
	})();
}

function printTokens (tokens) {
	const invalidTokens = tokens.filter(token => !token.valid);
	if (invalidTokens.length > 0) {
		invalidTokens.forEach(token =>
			error(token.line, `unexpected token ${token.value}`));
		return true;
	}
	console.log(JSON.stringify(tokens, null, 2));
}







