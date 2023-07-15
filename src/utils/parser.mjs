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
const arr = [1,2,3]
const bar = [{baz: true, arr: [1,2,3]}, 42]

function addTwo (x) {
  return x + 2
}
addOne(1)`

/**
 * A program is a script that is parsed and then evaluated.
 * A script is parsed into an AST where each node represents a valid JS expression.
 * Certain AST nodes have children while some don't.
 * The program is evaluated by recursively calling eval on every node in the program AST with env.
 * A global env is created by parsing variables and functions and adding them to an object.
 * An env is created at time of evaluation.
 * A function expression is stored with it's env as a pair.
 * A function call is evaluated under the env in which it was defined extended by function
    params and function name if it was not anonymous.
 * Should I create a new AST or evaluate the one made by Prisma?
 */

function getExpType(exp) {
  if (exp.type === "Literal") {
    if (exp.value === null) return "null"
    else return typeof exp.value
  } else if (exp.type === "Identifier") return "undefined"
  else return exp.type
}

function parseExp(exp) {
  // write a switch statement and call appropriate parser of type
  let parsedExp = null
  switch (exp.type) {
    case "Literal":
      parsedExp = exp.value
      break
    case "Identifier":
      parsedExp = undefined
      break
    case "ArrayExpression":
      parsedExp = parseArray(exp.elements)
      break
    case "ObjectExpression":
      parsedExp = parseObject(exp.properties)
      break
    // TODO: Complete remaining expressions
    case "FunctionExpression":
      break
    case "ArrowFunctionExpression":
      break
    case "FunctionDeclaration":
      break
    default:
      break
  }
  return parsedExp
}

function parseArray(elements) {
  const parsedElements = []
  elements.forEach((element) => {
    const parsedElement = {
      type: getExpType(element),
      value: parseExp(element),
    }
    // DONE: parse each element by type
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
    // DONE: parse each property by type
    parsedProperties.push(parsedProperty)
  })
  return parsedProperties
}

function getVariable(variable, env) {
  if (env.hasOwnProperty(variable)) {
    return env[variable]
  } else return undefined
}

function parseVariableDeclaration(
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
      //...declarations[declarations.length - 1].init,
      type: getExpType({ ...declarationsData }),
      value: parseExp({ ...declarationsData }), // Recursively parse expression
    }

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
        ;[globals, globalsScript] = parseVariableDeclaration(
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

console.log(globals)
//const bar = [{baz: true, arr: [1,2,3]}, 42]
// globals.bar.value.forEach((e) => {
//   if (e.type === "ObjectExpression") console.log(e.properties)
//   if (e.type === "ArrayExpression") console.log(e.elements)
//   else console.log(e)
// })
// console.log(globals.bar.elements[1].elements.forEach((e) => console.log(e)))
