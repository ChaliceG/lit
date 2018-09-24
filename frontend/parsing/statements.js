const AST = require('../ast.js').build;
module.exports = function (T, error, descend) {
  return {
    program: () => {
      var statements = [];
      while(!T.atEnd()) {
        statements.push(descend('statement'));
      }
      return AST({
        operation: 'PROGRAM',
        line: 0,
        statements: statements
      });
    },
    print: () => {
      return AST({
        operation: 'PRINT',
        line: T.previous().line,
        value: descend('expression')
      });
    },
    statement: () => {
      if (T.match('VAL')) return descend('valueDef');
      if (T.match('SHAPE')) return descend('shapeDef');
      if (T.match('WHILE')) return descend('whileStmt');
      if (T.match('PRINT')) return descend('print');
      return descend('expression');
    },
    whileStmt: () => {
      if (T.peek().type === 'LEFT_PAREN') {
        T.consume('LEFT_PAREN', 'expected (');
        var test = descend('expression');
        T.consume('RIGHT_PAREN', 'expected )');
        return AST({
          operation: 'WHILE',
          line: T.previous().line,
          test: test,
          statements: descend('block')
        });
      } else {
        var subject = T.consume('IDENTIFIER', 'expected identifier');
        T.consume('IS', 'expected is');
        var shape = T.consume('IDENTIFIER', 'expected shape');
        return AST({
          operation: 'WHILE_SHAPE',
          line: T.previous().line,
          subject: subject.value,
          shape: shape.value,
          statements: descend('block')
        });
      }
    },
    block: () => {
      T.consume('DOUBLE_LEFT_BRACE', 'expected {{');
      const statements = [];
      while (T.peek().type !== 'DOUBLE_RIGHT_BRACE'
        && T.peek().type !== 'END') {
        statements.push(descend('statement'));
      }
      T.advance();
      return statements;
    },
    valueDef: () => {
      var name = T.consume('IDENTIFIER', 'expected identifier');
      T.consume('COLON', 'expected :');
      return AST({
        operation: 'VALUE',
        line: T.previous().line,
        identifier: name.value,
        value: descend('expression')
      });
    },
    shapeDef: () => {
      var name = T.consume('IDENTIFIER', 'expected identifier'), shapes = [];
      T.consume('COLON', 'expected :');
      do {
        shapes.push(descend('predicate'));
      } while (T.match('PIPE'));
      return AST({
        operation: 'SHAPE',
        line: T.previous().line,
        identifier: name,
        shapes: shapes
      });
    }
  }
}