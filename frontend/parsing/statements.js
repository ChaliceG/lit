const AST = require('../ast.js');
module.exports = function (T, error, descend) {
  return {
    program: () => {
      var statements = [];
      while(!T.atEnd()) {
        statements.push(descend('statement'));
      }
      return AST({ type:'PROGRAM', value: 'exec' }, ...statements);
    },
    print: () => {
      return AST({
        type: 'PRINT',
        value: 'print'
      }, descend('expression'));
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
          type: 'WHILE_EXPRESSION',
          value: 'while'
        }, test, ...descend('block'));
      } else {
        var subject = T.consume('IDENTIFIER', 'expected identifier');
        T.consume('IS', 'expected is');
        var shape = T.consume('IDENTIFIER', 'expected shape');
        return AST({
          type: 'WHILE_SHAPE',
          value: 'while'
        }, subject, shape, ...descend('block'));
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
      var value = descend('expression');
      return AST({
        type: 'VALUE_DEFINITION',
        value: 'val'
      }, name, value);
    },
    shapeDef: () => {
      var name = T.consume('IDENTIFIER', 'expected identifier'), shapes = [];
      T.consume('COLON', 'expected :');
      do {
        shapes.push(descend('predicate'));
      } while (T.match('PIPE'));
      return AST({
        type: 'SHAPE_DEFINITION',
        value: 'shape'
      }, name, ...shapes);
    },
  }
}