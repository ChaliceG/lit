module.exports = function (tokens) {
  var current = 0;

  function match (...tokenTypes) {
    if (tokenTypes.filter(check).length > 0) {
      advance();
      return true;
    }
    return false;
  }

  function consume (desiredType, errorMsg) {
    if (check(desiredType)) return advance();
    throw {
      token: peek(),
      msg: errorMsg
    };
  }

  function check (tokenType) {
    return atEnd()
      ? false
      : peek().type === tokenType;
  }

  function advance () {
    if (!atEnd()) current++;
    return previous();
  }

  function atEnd () {
    return peek().type === 'END';
  }

  function previous () {
    return tokens[current - 1] || {line: 0};
  }

  function peek () {
    return tokens[current];
  }
  function peek2 () {
    return tokens[current + 1] || {type: 'END'};
  }
  return {
    match: match,
    check: check,
    advance: advance,
    atEnd: atEnd,
    previous: previous,
    peek: peek,
    peek2: peek2,
    consume: consume
  };
}
