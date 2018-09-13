const AST = require('../ast.js');
const Parser = function (tokens) {
var current = 0;

const grammar = {
	expression: () => grammar.equality(),
	logicOr: binary('logicAnd', ['OR']),
	logicAnd: binary('equality', ['AND']),
	equality: binary('comparison', ['EQUAL', 'BANG_EQUAL']),
	comparison: binary('addition', ['LESS', 'GREATER', 'LESS_EQUAL', 'GREATER_EQUAL']),
	addition: binary('multiplication', ['PLUS', 'MINUS']),
	multiplication: binary('unary', ['STAR', 'SLASH']),
	unary: () => match('BANG', 'MINUS')
		? AST(previous(), grammar.unary())
		: grammar.primary(),
	primary: primary,
	value: value
};

function value () {
	switch (previous().type) {
		case 'LEFT_BRACE':
			var inner = grammar.map();
			consume('RIGHT_BRACE', 'expected }');
			return inner;
		case 'LEFT_BRACKET':
			var inner = grammar.list();
			consume('RIGHT_BRACKET', 'expected ]');
			return inner;
		default:
			return AST(previous());
	}
}

function primary () {
	if (match('LEFT_PAREN')) {
		var inner = grammar.expression();
		consume('RIGHT_PAREN', 'expected )');
		return inner;
	}
	if (match('IDENTIFIER')) {
		return AST(previous());
	}
	if (match('LEFT_BRACE', 'LEFT_BRACKET', 'NUMBER', 'STRING', 'NULL')) {
		return grammar.value();
	}
	throw error(peek(), "expected expression");
}

function binary (nextRule, matchOperators) {
	return function () {
		var left = grammar[nextRule](), operator, right;

		while(match(...matchOperators)) {
			operator = previous();
			right = grammar[nextRule]();
			left = AST(left, operator, right);
		}

		return left;
	}
}

function consume (desiredType, errorMsg) {
	if (check(desiredType)) return advance();
	throw error(peek(), errorMsg);
}

function error (nextToken, errorMsg) {
	return {
		token: nextToken,
		msg: errorMsg
	};
}

function match (...tokenTypes) {
	if (tokenTypes.filter(check).length > 0) {
		advance();
		return true;
	}
	return false;
}

function check (tokenType) {
	return peek().type === 'END'
		? false
		: peek().type === tokenType;
}

function advance () {
	if (peek().type !== 'END') current++;
	return previous();
}

function previous () {
	return tokens[current - 1];
}

function peek () {
	return tokens[current];
}

return (function () {
	// try {
		return grammar.expression();
	// } catch (e) {
	// 	return null;
	// }
})();
}

module.exports = Parser;
