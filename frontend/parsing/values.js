const AST = require('../ast.js');
module.exports = function (T, error, descend) {
  return {
    reference: (shapeContext) => {
      var first = descend('primary', shapeContext), referenceList = [first], prop;
      while(T.match('DOUBLE_LEFT_BRACKET', 'PERIOD', 'LEFT_PAREN')) {
        if (T.previous().type === 'LEFT_PAREN') {
          referenceList.push(call(shapeContext));
        }
        if (T.previous().type === 'PERIOD') {
          referenceList.push(AST({
            type: 'PERIOD',
            value: '.'
          }, T.consume('IDENTIFIER', 'expected identifier')));
        }
        if (T.previous().type === 'DOUBLE_LEFT_BRACKET') {
          referenceList.push(AST({
            type: 'MAP_GET',
            value: 'get'
          }, descend('expression', shapeContext)));
          T.consume('DOUBLE_RIGHT_BRACKET', 'expected ]]');
        }
      }
      if (referenceList.length === 1) return first;
      return AST({
        type: 'REFERENCE',
        value: 'ref'
      }, ...referenceList);
    },
    call: (shapeContext) => {
      if (shapeContext) {
        throw error(T.previous(), 'fn calls are not allowed when defining a shape');
      }
      if (T.peek().type !== 'RIGHT_PAREN') {
        var arg = descend('expression', shapeContext);
        T.consume('RIGHT_PAREN', 'expected )');
        return AST({
          type: 'CALL',
          value: 'call'
        }, first, arg);
      }
      T.consume('RIGHT_PAREN', 'expected )');
      return AST({ type: 'CALL', value: 'call' }, first);
    },
    map: (shapeContext) => {
      var pairs = [], key, colon, value;
      while(T.match('STRING', 'IDENTIFIER')) {
        key = AST(T.previous());
        T.consume('COLON', 'expected :');
        value = descend('expression', shapeContext);
        pairs.push(AST(key, value));
      }
      return AST({
        type: 'MAP',
        value: 'map'
      }, ...pairs);
    },
    list: (shapeContext) => {
      var elements = [];
      while (T.peek().type !== 'RIGHT_BRACKET'
        && T.peek().type !== 'END') {
        elements.push(descend('expression', shapeContext));
      }
      return AST({
        type: 'LIST',
        value: 'list'
      }, ...elements);
    },
    value: (shapeContext) => {
      switch (T.previous().type) {
        case 'LEFT_BRACE':
          var inner = descend('map', shapeContext);
          T.consume('RIGHT_BRACE', 'expected }');
          return inner;
        case 'LEFT_BRACKET':
          var inner = descend('list', shapeContext);
          T.consume('RIGHT_BRACKET', 'expected ]');
          return inner;
        default:
          return AST(T.previous());
      }
    },
    primary: (shapeContext) => {
      if (T.match('LEFT_PAREN')) {
        var inner = descend('expression', shapeContext);
        T.consume('RIGHT_PAREN', 'expected )');
        return inner;
      }
      if (T.match('IDENTIFIER')) {
        return AST(T.previous());
      }
      if (T.match(
        'LEFT_BRACE',
        'LEFT_BRACKET',
        'NUMBER',
        'STRING',
        'NULL',
        'BOOLEAN')) {

        return descend('value', shapeContext);
      }
      throw error(T.peek(), "expected expression");
    }
  }
}