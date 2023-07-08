import esprima from "esprima"

var programScript = `
// this is a comment
let y, z = 2
function addOne (x) {
  return x + 1
}
var foo = "a"
var n = null
var d = undefined
y = 1
console.log('hello world')
const bar = [{baz: true, arr: [1,2,3]}, 42]

function addTwo (x) {
  return x + 2
}`

function getExpType(exp) {
  if (exp.type === "Literal") {
    if (exp.value === null) return "null"
    else return typeof exp.value
  } else if (exp.type === "Identifier") return "undefined"
  else return exp.type
}

function parseExp(exp) {
  // write a switch statement and call appropriate parser of type
  switch (exp.type) {
    case "Literal":
      exp.value
      break
    case "ArrayExpression":
      parseArray(exp.elements)
      break
    case "ObjectExpression":
      parseObject(exp.properties)
      break
    // TODO: Complete remaining expressions
    default:
      break
  }
}

function getLiteralValue(literal) {
  return literal.value
}
function parseArray(elements) {
  const parsedElements = []
  elements.forEach((element) => {
    const parsedElement = {
      type: getExpType(element),
      value: parseExp(element),
    }
    // TODO: parse each element by type
    parsedElements.push(parsedElement)
  })
  return parsedElements
}
function parseObject(properties) {
  const parsedProperties = []
  properties.forEach((p) => {
    const parsedProperty = {
      type: getExpType(p.value),
      identifier: p.key.name,
      value: parseExp(p.value),
    }
    // TODO: parse each property by type
    parsedProperties.push(parsedProperty)
  })
  return parsedProperties
}

// This should lookup already parsed variables in env
// TODO: replace this with return env[variable]
function getVariable(variableObj) {
  let value = null
  switch (variableObj.type) {
    case "Literal":
      value = getLiteralValue(variableObj)
      break
    case "ArrayExpression":
      value = getArrayValue(variableObj.elements)
      break
    case "ObjectExpression":
      value = getObjectValue(variableObj.properties)
      break
    case "FunctionExpression" ||
      "FunctionDeclaration" ||
      "ArrowFunctionExpression":
      value = getFunctionValue(variableObj)
      break
    case "VariableDeclaration":
      value = getVariable(variableObj)
      break
  }
  return value
}

function parseVariableDeclarations(
  node,
  meta,
  programScript,
  env = {},
  varsScript = ""
) {
  let declarations = node.declarations
  declarations.forEach((d) => {
    const declarationsData = declarations[declarations.length - 1].init
    let newVar = {
      start: meta.start.offset,
      end: meta.end.offset,
      keyword: node.kind,
      identifier: d.id.name,
      ...declarations[declarations.length - 1].init,
      type: getExpType({ ...declarationsData }),
      value: parseExp({ ...declarationsData }), // Recursively parse expression
    }
    // TODO: REMOVE THIS BLOCK
    // const varType = declarations[declarations.length - 1].init.type
    // switch (newVar.type) {
    //   case "Literal":
    //     newVar = {
    //       ...newVar,
    //       ...declarationsData.value,
    //     }
    //     break
    //   case "ArrayExpression":
    //     newVar = {
    //       ...newVar,
    //       ...parseArray(declarationsData.elements),
    //     }
    //     break
    //   case "ObjectExpression":
    //     newVar = {
    //       ...newVar,
    //       ...parseObject(declarationsData.properties),
    //     }
    //     break
    //   // TODO: Complete remaining cases
    // }
    // SIDE EFFECTS!!!
    env[newVar.identifier] = newVar
    const varDeclarationScript = `${programScript.substring(
      newVar.start,
      newVar.end
    )}\n`
    varsScript += varDeclarationScript
  })
  return [env, varsScript]
}

// State
let globals = {}
let globalsScript = ""

const AST = esprima.parseScript(
  programScript,
  { comment: true },
  function (node, meta) {
    switch (node.type) {
      case "VariableDeclaration":
        ;[globals, globalsScript] = parseVariableDeclarations(
          node,
          meta,
          programScript,
          globals,
          globalsScript
        )
        break
      // TODO: Complete remaining cases
    }
  }
)

// console.log(globals)
globals.bar.elements.forEach((e) => {
  if (e.type === "ObjectExpression") console.log(e.properties)
  else console.log(e)
})
// console.log(globals.bar.elements[1].elements.forEach((e) => console.log(e)))
