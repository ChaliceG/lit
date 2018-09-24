const AST = require('../ast.js').build;
module.exports = function (T, error, descend) {
  return {
    reference: (shapeContext) => {
      const startOfRef = T.previous().line;
      var first = descend('primary', shapeContext), referenceList = [first], prop;
      while(T.match('DOUBLE_LEFT_BRACKET', 'PERIOD', 'LEFT_PAREN')) {
        if (T.previous().type === 'LEFT_PAREN') {
          referenceList.push(call(shapeContext));
        }
        if (T.previous().type === 'PERIOD') {
          referenceList.push(AST({
            operation: 'PERIOD',
            line: T.previous().line,
            identifier: T.consume('IDENTIFIER', 'expected identifier')
          }));
        }
        if (T.previous().type === 'DOUBLE_LEFT_BRACKET') {
          referenceList.push(AST({
            operation: 'COLLECTION_GET',
            line: T.previous().line,
            identifier: descend('expression', shapeContext)
          }));
          T.consume('DOUBLE_RIGHT_BRACKET', 'expected ]]');
        }
      }
      if (referenceList.length === 1) return first;
      return AST({
        operation: 'REFERENCE',
        line: startOfRef,
        references: referenceList
      });
    },
    call: (shapeContext) => {
      if (shapeContext) {
        throw error(T.previous(), 'fn calls are not allowed when defining a shape');
      }
      const line = T.previous().line;
      if (T.peek().type !== 'RIGHT_PAREN') {
        var arg = descend('expression', shapeContext);
        T.consume('RIGHT_PAREN', 'expected )');
        return AST({
          operation: 'CALL',
          line: line,
          function: first,
          argument: arg
        });
      }
      T.consume('RIGHT_PAREN', 'expected )');
      return AST({
        operation: 'CALL',
        line: line,
        function: first
      });
    },
    map: (shapeContext) => {
      const line = T.previous().line;
      var pairs = [], key, colon, value;
      while(T.match('STRING', 'IDENTIFIER')) {
        key = T.previous().value;
        T.consume('COLON', 'expected :');
        value = descend('expression', shapeContext);
        pairs.push(AST({
          operation: 'PAIR',
          line: T.previous().line,
          key: key,
          value: value
        }));
      }
      return AST({
        operation: 'MAP',
        line: line,
        pairs: pairs
      });
    },
    list: (shapeContext) => {
      const line = T.previous().line;
      var elements = [];
      while (T.peek().type !== 'RIGHT_BRACKET'
        && T.peek().type !== 'END') {
        elements.push(descend('expression', shapeContext));
      }
      return AST({
        operation: 'LIST',
        line: line,
        elements: elements
      });
    },
    value: (shapeContext) => {
      const type = T.previous().type;
      switch (type) {
        case 'LEFT_BRACE':
          var inner = descend('map', shapeContext);
          T.consume('RIGHT_BRACE', 'expected }');
          return inner;
        case 'LEFT_BRACKET':
          var inner = descend('list', shapeContext);
          T.consume('RIGHT_BRACKET', 'expected ]');
          return inner;
        default:
          return AST({
            operation: type,
            line: T.previous().line,
            value: T.previous().value
          });
      }
    },
    primary: (shapeContext) => {
      if (T.match('LEFT_PAREN')) {
        var inner = descend('expression', shapeContext);
        T.consume('RIGHT_PAREN', 'expected )');
        return inner;
      }
      if (T.match('IDENTIFIER')) {
        return AST({
          operation: 'IDENTIFIER',
          line: T.previous().line,
          identifier: T.previous().value
        });
      }
      if (T.match(
        'LEFT_BRACE',
        'LEFT_BRACKET',
        'NUMBER',
        'STRING',
        'NULL',
        'BOOLEAN')) return descend('value', shapeContext);
      throw error(T.peek(), "expected expression");
    }
  }
}