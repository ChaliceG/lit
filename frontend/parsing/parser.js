const AST = require('../ast.js');
const Parser = function (tokens) {
var current = 0;

const grammar = {
	program: program,
	statement: statement,
	valueDef: valueDef,
	shapeDef: shapeDef,
	predicate: predicate,
	map: map,
	list: list,
	expression: (shapeContext) => grammar.equality(shapeContext),
	logicOr: binary('logicAnd', ['OR']),
	logicAnd: binary('equality', ['AND']),
	equality: binary('comparison', ['EQUAL', 'BANG_EQUAL']),
	comparison: binary('addition', ['LESS', 'GREATER', 'LESS_EQUAL', 'GREATER_EQUAL']),
	addition: binary('multiplication', ['PLUS', 'MINUS']),
	multiplication: binary('unary', ['STAR', 'SLASH']),
	unary: (shapeContext) => match('BANG', 'MINUS')
		? AST(previous(), grammar.unary(shapeContext))
		: grammar.reference(shapeContext),
	reference: reference,
	primary: primary,
	value: value
};

function statement () {
	if (match('VAL')) return grammar.valueDef();
	if (match('SHAPE')) return grammar.shapeDef();
	if (match('WHILE')) return grammar.whileStmt();
	return grammar.expression();
}

function valueDef () {
	var name = consume('IDENTIFIER', 'expected identifier');
	consume('COLON', 'expected :');
	var value = grammar.expression();
	return AST({
		type: 'VALUE_DEFINITION',
		value: 'val'
	}, name, value);
}

function shapeDef () {
	var name = consume('IDENTIFIER', 'expected identifier'), shapes = [];
	consume('COLON', 'expected :');
	do {
		shapes.push(grammar.predicate());
	} while (match('PIPE'));
	return AST({
		type: 'SHAPE_DEFINITION',
		value: 'shape'
	}, name, ...shapes);
}

function predicate () {
	if (peek().type === 'IDENTIFIER' && peek2().type === 'IDENTIFIER') {
		var supertype = advance();
		var binding = advance();
		consume('WHERE', 'expected where');
		var predicate = grammar.expression(true);
		return AST({
			type: 'PREDICATE',
			value: 'predicate'
		}, supertype, binding, predicate);
	}
	return grammar.expression(true);
}

function program () {
	var statements = [];
	while(!atEnd()) {
		statements.push(grammar.statement());
	}
	return AST({ type:'PROGRAM', value: 'exec' }, ...statements);
}

function reference (shapeContext) {
	var first = grammar.primary(shapeContext), referenceList = [first], prop;
	while(match('DOUBLE_LEFT_BRACKET', 'PERIOD', 'LEFT_PAREN')) {
		if (previous().type === 'LEFT_PAREN') {
			if (shapeContext) {
				throw error(previous(), 'function calls are not allowed when defining a shape');
			}
			if (peek().type !== 'RIGHT_PAREN') {
				var arg = grammar.expression(shapeContext);
				consume('RIGHT_PAREN', 'expected )');
				return AST({
					type: 'CALL',
					value: 'call'
				}, first, arg);
			}
			consume('RIGHT_PAREN', 'expected )');
			return AST({ type: 'CALL', value: 'call' }, first);
		}
		if (previous().type === 'PERIOD') {
			prop = AST(consume('IDENTIFIER', 'expected identifier'));
		}
		if (previous().type === 'DOUBLE_LEFT_BRACKET') {
			prop = grammar.expression(shapeContext);
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

function map (shapeContext) {
	var pairs = [], key, colon, value;
	while(match('STRING', 'IDENTIFIER')) {
		key = AST(previous());
		colon = consume('COLON', 'expected :');
		value = grammar.expression(shapeContext);
		pairs.push(AST(key, colon, value));
	}
	return AST({
		type: 'MAP',
		value: 'map'
	}, ...pairs);
}

function list (shapeContext) {
	var elements = [];
	while (peek().type !== 'RIGHT_BRACKET'
		&& peek().type !== 'END') {
		elements.push(grammar.expression(shapeContext));
	}
	return AST({
		type: 'LIST',
		value: 'list'
	}, ...elements);
}

function value (shapeContext) {
	switch (previous().type) {
		case 'LEFT_BRACE':
			var inner = grammar.map(shapeContext);
			consume('RIGHT_BRACE', 'expected }');
			return inner;
		case 'LEFT_BRACKET':
			var inner = grammar.list(shapeContext);
			consume('RIGHT_BRACKET', 'expected ]');
			return inner;
		default:
			return AST(previous());
	}
}

function primary (shapeContext) {
	if (match('LEFT_PAREN')) {
		var inner = grammar.expression(shapeContext);
		consume('RIGHT_PAREN', 'expected )');
		return inner;
	}
	if (match('IDENTIFIER')) {
		return AST(previous());
	}
	if (match('LEFT_BRACE', 'LEFT_BRACKET', 'NUMBER', 'STRING', 'NULL')) {
		return grammar.value(shapeContext);
	}
	throw error(peek(), "expected expression");
}

function binary (nextRule, matchOperators) {
	return function (shapeContext) {
		var left = grammar[nextRule](shapeContext), operator, right;

		while(match(...matchOperators)) {
			operator = previous();
			right = grammar[nextRule](shapeContext);
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
	return atEnd()
		? false
		: peek().type === tokenType;
}

function advance () {
	if (!atEnd()) current++;
	return previous();
}

function atEnd () {
	return peek().type === 'END';
}

function previous () {
	return tokens[current - 1];
}

function peek () {
	return tokens[current];
}
function peek2 () {
	return tokens[current + 1] || {type: 'END'};
}

return (function () {
	// try {
		return grammar.program();
	// } catch (e) {
	// 	return null;
	// }
})();
}

module.exports = Parser;
