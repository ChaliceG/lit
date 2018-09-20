module.exports = function (ast) {
  //console.log(JSON.stringify(ast, null , 2));
  E(ast);
}

const variables = {};
const variablesInScope = {};

function E (node) {
  if (node.children === undefined) {
    return terminal(node);
  }

  if (node.children.length === 1) return E(node.children[0]);
  const L = node.children[1]
  const R = node.children[2];
  switch (node.children[0].type) {
    //arithmetic
    case 'PLUS':
      return E(L) + E(R);
    case 'MINUS':
      return E(L) - E(R);
    case 'STAR':
      return E(L) * E(R);
    case 'SLASH':
      return E(L) / E(R);

    //logic
    case 'OR':
      return E(L) || E(R);
    case 'AND':
      return E(L) && E(R);

    //comparison
    case 'GREATER_EQUAL':
      return E(L) >= E(R);
    case 'LESS_EQUAL':
      return E(L) <= E(R);
    case 'GREATER':
      return E(L) > E(R);
    case 'LESS':
      return E(L) < E(R);

    //equality
    case 'BANG_EQUAL':
      return !equal(E(L), E(R));
    case 'EQUAL':
      return equal(E(L), E(R));
    case 'BANG':
      return !E(L);
    case 'PROGRAM':
      executeStatements(node.children.slice(1));
      break;
    case 'PRINT':
      console.log(E(L));
      break;
    case 'VALUE_DEFINITION':
      variables[L.value] = E(R);
      variablesInScope[L.value] = true;
      break;
    case 'WHILE_EXPRESSION':
      whileStmt(node.children.slice(1));
      break;
  }
}

function whileStmt (statements) {
  if (statements.length === 1) return;
  while(E(statements[0])) {
    executeStatements(statements.slice(1));
  }
}

function equal (L, R) {
  return L === R;
}

function executeStatements (statements) {
  (statements || []).forEach(E);
}

function terminal (node) {
  if (node === undefined) return undefined;
  switch (node.type) {
    case 'PROGRAM':
      return undefined;
    case 'NUMBER':
      return node.value;
    case 'STRING':
      return node.value;
    case 'BOOLEAN':
      return node.value;
    case 'IDENTIFIER':
      return getValue(node.value);
    default:
      return node
  }
}

function getValue (identifier) {
  if (!variablesInScope[identifier]) {
    throw `${identifier} is undefined`
  }
  return variables[identifier];
}
