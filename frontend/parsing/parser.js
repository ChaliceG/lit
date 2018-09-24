module.exports = function (tokenFeed) {

	function error (nextToken, errorMsg) {
		return {
			token: nextToken,
			msg: errorMsg
		};
	}

	const descend = (next, shapeContext) => Grammar[next](shapeContext);
	const Statements = require('./statements')(tokenFeed, error, descend);
	const Expressions = require('./expressions')(tokenFeed, error, descend);
	const Values = require('./values')(tokenFeed, error, descend);
	const Grammar = require('./grammar')(Statements, Expressions, Values);

	return Grammar.program();
}
