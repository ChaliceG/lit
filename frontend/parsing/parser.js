const AST = require('../ast.js');
const Parser = function (tokens) {
var current = 0;

const grammar = {
	map: map,
	list: list,
	expression: () => grammar.equality(),
	logicOr: binary('logicAnd', ['OR']),
	logicAnd: binary('equality', ['AND']),
	equality: binary('comparison', ['EQUAL', 'BANG_EQUAL']),
	comparison: binary('addition', ['LESS', 'GREATER', 'LESS_EQUAL', 'GREATER_EQUAL']),
	addition: binary('multiplication', ['PLUS', 'MINUS']),
	multiplication: binary('unary', ['STAR', 'SLASH']),
	unary: () => match('BANG', 'MINUS')
		? AST(previous(), grammar.unary())
		: grammar.reference(),
	reference: reference,
	primary: primary,
	value: value
};

function reference () {
	var first = primary(), referenceList = [first], prop;
	while(match('DOUBLE_LEFT_BRACKET', 'PERIOD', 'LEFT_PAREN')) {
		if (previous().type === 'LEFT_PAREN') {
			var arg = grammar.expression();
			consume('RIGHT_PAREN', 'expected )');
			return AST({
				type: 'CALL',
				value: 'call'
			}, first, arg);
		}
		if (previous().type === 'PERIOD') {
			prop = AST(consume('IDENTIFIER', 'expected identifier'));
		}
		if (previous().type === 'DOUBLE_LEFT_BRACKET') {
			prop = grammar.expression();
			consume('DOUBLE_RIGHT_BRACKET', 'expected ]]');
		}
		referenceList.push(prop);
	}
	if (referenceList.length === 1) return first;
	return AST({
		type: 'PERIOD',
		value: '.'
	}, ...referenceList);
}

function map () {
	var pairs = [], key, colon, value;
	while(match('STRING', 'IDENTIFIER')) {
		key = AST(previous());
		colon = consume('COLON', 'expected :');
		value = grammar.expression();
		pairs.push(AST(key, colon, value));
	}
	return AST({
		type: 'MAP',
		value: 'map'
	}, ...pairs);
}

function list () {
	var elements = [];
	while (peek().type !== 'RIGHT_BRACKET'
		&& peek().type !== 'END') {
		elements.push(grammar.expression());
	}
	return AST({
		type: 'LIST',
		value: 'list'
	}, ...elements);
}

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
