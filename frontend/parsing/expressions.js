const AST = require('../ast.js').build;
module.exports = function (T, error, descend) {
  function binary (nextRule, matchOperators) {
    return function (shapeContext) {
      var left = descend(nextRule, shapeContext), operator, right;
      while(T.match(...matchOperators)) {
        operator = T.previous();
        right = descend(nextRule, shapeContext);
        left = AST({
          operation: 'BINARY',
          line: operator.line,
          operator: operator.type,
          left: left,
          right: right
        });
      }
      return left;
    }
  }

  return {
    predicate: () => {
      if (T.peek().type === 'IDENTIFIER' && T.peek2().type === 'IDENTIFIER') {
        var supertype = T.advance();
        var binding = T.advance();
        T.consume('WHERE', 'expected where');
        var predicate = descend('expression', true);
        return AST({
          operation: 'PREDICATE',
          line: T.previous().line,
          supertype: supertype,
          binding: binding,
          predicate: predicate
        });
      }
      return descend('expression', true);
    },
    expression: (shapeContext) => descend('logicOr', shapeContext),
    logicOr: binary('logicAnd', ['OR']),
    logicAnd: binary('equality', ['AND']),
    equality: binary('comparison', ['EQUAL', 'BANG_EQUAL']),
    comparison: binary('addition', ['LESS', 'GREATER', 'LESS_EQUAL', 'GREATER_EQUAL']),
    addition: binary('multiplication', ['PLUS', 'MINUS']),
    multiplication: binary('unary', ['STAR', 'SLASH', 'MOD']),
    unary: (shapeContext) => T.match('BANG', 'MINUS')
      ? AST({
          operation: 'UNARY',
          line: T.previous().line,
          operator: T.previous().value,
          operand: descend('unary', shapeContext)
        })
      : descend('reference', shapeContext),
  }
}