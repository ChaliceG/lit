const TokenTypes = {
	LEFT_PAREN: sequence('('),
	RIGHT_PAREN: sequence(')'),
	LEFT_BRACE: sequence('{'),
	RIGHT_BRACE: sequence('}'),
	LEFT_BRACKET: sequence('['),
	RIGHT_BRACKET: sequence(']'),
	COMMA: sequence(','),
	PERIOD: sequence('.'),
	MINUS: sequence('-'),
	PLUS: sequence('+'),
	SEMI: sequence(';'),
	SLASH: sequence('/'),
	STAR: sequence('*'),
	COLON: sequence(':'),
	BANG: sequence('!'),
	EQUAL: sequence('='),
	GREATER: sequence('>'),
	LESS: sequence('<'),
	PIPE: sequence('|'),
	OR: sequence('||'),
	AND: sequence('&&'),
	GREATER_EQUAL: sequence('>='),
	LESS_EQUAL: sequence('<='),
	BANG_EQUAL: sequence('!='),
	DOUBLE_LEFT_BRACE: sequence('{{'),
	DOUBLE_RIGHT_BRACE: sequence('}}'),
	DOUBLE_LEFT_BRACKET: sequence('[['),
	DOUBLE_RIGHT_BRACKET: sequence(']]'),

	//whitespace
	SPACE: sequence(' '),
	TAB: sequence('	'),
	NEWLINE: sequence('\n'),
	END: sequence('\0'),

	//keywords
	WHILE: sequence('while'),
	VAL: sequence('val'),
	IS: sequence('is')
}

function sequence (string) {
	return {
		sequence: string.split('')
	};
}

function buildRadix() {
	const radix = {};
	var focus, i , char, tokenType;
	Object.keys(TokenTypes)
	.map(key => [key, TokenTypes[key]])
	.forEach(kvp => {
		focus = radix;
		i = 0;
		tokenType = kvp[1]
		for(;i < tokenType.sequence.length; i++) {
			char = tokenType.sequence[i];
			if (!focus[char]) {
				focus[char] = {};
			}
			focus = focus[char];
		}
		focus.valid = true;
		focus.type = kvp[0];
	});
	return radix;
}

module.exports = {
	radix: buildRadix(),
	ignoreTokens: {
		'SPACE': true,
		'TAB': true,
		'NEWLINE': true,
		'COMMENT': true
	}
};
