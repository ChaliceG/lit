const scanner = require('./frontend/scanning/scanner');
const parser = require('./frontend/parsing/parser');

const passes = [
	require('./frontend/shapes/shapes'),
	printAst,
	require('./interpreter/interpreter')
];

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
	process.exit(execute(tokens) ? 0 : 1);
} else {
	console.log('Welcome to Lit V -99\n');
	(function interpret () {
		reader.question('> ', (input) => {
			const tokens = scanner(input);
			execute(tokens);
			interpret();
		});
	})();
}

function execute (tokenFeed) {
	var ast = parseTokens(tokenFeed);
	for (var i = 0; i < passes.length; i++) {
		if (ast === false) {
			return false;
		}
		ast = passes[i](ast);
	}
}

function printAst (ast) {
	console.log(JSON.stringify(ast, null ,2));
	return false;
}

function parseTokens (tokens) {
	try {
		return parser(tokens);
	} catch (e) {
		if (e.token !== undefined) {
			error(e.token, e.msg);
		} else {
			throw e;
		}
		return false;
	}
}
