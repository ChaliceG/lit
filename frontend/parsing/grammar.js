module.exports = function (Statements, Expressions, Values) {
  return {
    /*

    program ->
      statement*

    */
    program: Statements.program,
    /*

    statement ->
      valueDef
      shapeDef
      whileStmt
      block

    */
    statement: Statements.statement,
    /*

    valueDef ->
      "val" IDENTIFIER":" expression

    */
    valueDef: Statements.valueDef,
    /*

    shapeDef ->
      "shape" IDENTIFIER":" predicate

    */
    shapeDef: Statements.shapeDef,
    /*

    whileStmt ->
      "while" "(" expression ")" block
      "while" IDENTIFIER "is" IDENTIFIER block

    */
    whileStmt: Statements.whileStmt,
    /*

    block ->
      "{{" statement* "}}"

    */
    block: Statements.block,
    /*

    print ->
      "print" expresison

    */
    print: Statements.print,
    /*

    predicate ->
      IDENTIFIER IDENTIFIER "where" expression
      expression

    */
    predicate: Expressions.predicate,
    /*

    expression ->
      logicOr

    */
    expression: Expressions.expression,

    /*

      logicOr ->
        logicAnd ("||" logicAnd)*

    */
    logicOr: Expressions.logicOr,
    /*

      logicAnd ->
        equality ("&&" equality)*

    */
    logicAnd: Expressions.logicAnd,
    /*

      equality ->
        comparison (("="|"!=") comparison)*

    */
    equality: Expressions.equality,
    /*

      comparison ->
        addition ((">"|"<"|">="|"<=") addition)*

    */
    comparison: Expressions.comparison,
    /*

      addition ->
        multiplication (("+"|"-") multiplication)*

    */
    addition: Expressions.addition,
    /*

      multiplication ->
        unary (("*"|"/"|"%") unary)*

    */
    multiplication: Expressions.multiplication,
    /*

      unary ->
        ("!"|"-")reference

    */
    unary: Expressions.unary,
    /*
      NOTE: inside shape definitions the first rule under reference
      (function calls) are not allowed.  This could be represented
      in the grammar but would be too wordy.

      reference ->
        IDENTIFIER "(" expression ")" prop*
        primary prop*

      prop ->
        "." IDENTIFIER
        "[[" expression "]]"

    */
    reference: Values.reference,
    /*

      primary ->
        value
        IDENTIFIER
        "(" expression ")"

    */
    primary: Values.primary,
    /*

      value ->
        "true"
        "false"
        "null"
        NUMBER
        STRING
        map
        list

    */
    value: Values.value,
    /*

      map ->
        "{" keyValuePair* "}"

      keyValuePair ->
        STRING ":" expression
        IDENTIFIER ":" expression

    */
    map: Values.map,
    /*

      list ->
        "[" expression "]"

    */
    list: Values.list
  }
  /*
    STRING: "this is a \" string"
    NUMBER: /^[0-9]+(\.[0-9]*)?$/g
    IDENTIFIER: /^[a-zA-Z_]+$/g
  */
};


