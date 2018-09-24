/*
shape AST: {
	operation: string
	children: [AST]
	debug: {
		line: number
		text: string
	}
}

shape while: AST x where x: {
	...
	test: expression
	statements: [statement]
}

shape identifier: AST x where x: {
	...
	name: string
}
*/

// at the moment this is just a passthrough
module.exports = function (astNode) {
	return astNode;
}