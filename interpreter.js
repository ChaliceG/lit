const scanner = require('./frontend/scanning/scanner');
const parser = require('./frontend/parsing/parser');

const reader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

function error (token, message) {
	const tokenValue = token.type === 'END'
		? 'end of file'
		: token.value
	console.log(`[line ${token.line}] Error: ${message} at ${tokenValue}.`);
}

if (process.argv.length > 3) {
	console.log('usage: node interpreter.js [lit file]');
	process.exit(64);
}

if (process.argv.length === 3) {
	const fs = require('fs');
	const tokens = scanner(fs.readFileSync(process.argv[2]).toString());
	//printTokens(tokens);
	const err = parseTokens(tokens);
	process.exit(err ? 1 : 0);
} else {
	console.log('Welcome to Lit V -99\n');
	(function interpret () {
		reader.question('> ', (input) => {
			const tokens = scanner(input);
			//printTokens(tokens);
			parseTokens(tokens);
			interpret();
		});
	})();
}

function parseTokens (tokens) {
	try {
		const ast = parser(tokens);
		console.log(ast.toString());
		return false;
	} catch (e) {
		if (e.token !== undefined) {
			error(e.token, e.msg);
		} else {
			throw e;
		}
		return true;
	}
}

function printTokens (tokens) {
	const invalidTokens = tokens.filter(token => !token.valid);
	if (invalidTokens.length > 0) {
		invalidTokens.forEach(token =>
			error(token.line, `unexpected token ${token}`));
		return true;
	}
	console.log(JSON.stringify(tokens, null, 2));
}
