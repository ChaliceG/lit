module.exports = function (...subASTs) {
	return {
		toString: () => subASTs.length === 1
			? stringify(subASTs[0])
			: `(${subASTs
				.sort(prefix)
				.map(ast => ast.isAst
					? ast.toString()
					: ast.value)
				.join(' ')})`,
		isAst: true
	}
};

function stringify (terminal) {
	return terminal.type === 'STRING'
		? `"${terminal.value}"`
		: terminal.value;
}

function prefix (A, B) {
	if (A.isAst && B.isAst) return 0;
	return A.isAst ? 1 : -1;
}
