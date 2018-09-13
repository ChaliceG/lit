module.exports = function (...subASTs) {
	return {
		toString: () =>
			`(${subASTs
				.sort(prefix)
				.map(ast => ast.isAst
					? ast.toString()
					: ast.value)
				.join(' ')})`,
		isAst: true
	}
};

function prefix (A, B) {
	if (A.isAst && B.isAst) return 0;
	return A.isAst ? 1 : -1;
}
