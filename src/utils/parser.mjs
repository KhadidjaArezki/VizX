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
// TODO: Current parsing logic does not keep track of each exp's script. We might need that.
//       change the code in esprima.parseScript to somehow look up script for each exp.

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

function printAst(ast) {
  console.log(JSON.stringify(ast, null, 4))
}

function getExpType(exp) {
  if (exp.type === "Literal") {
    if (exp.value === null) return "null"
    else return typeof exp.value
  } else if (exp.type === "Identifier") return "undefined"
  else return exp.type
}

function parseExp(exp, meta, programScript) {
  let parsedExp = {
    start: meta.start.offset,
    end: meta.end.offset,
    type: getExpType(exp),
  }
  // parsedExp.script = getExpScript(programScript, parsedExp.start, parsedExp.end)

  switch (exp.type) {
    case "Literal":
      parsedExp.value = exp.value
      break
    case "Identifier":
      parsedExp.name = exp.name
      break
    case "ArrayExpression":
      parsedExp.elements = parseArray(exp.elements, meta, programScript)
      break
    case "ObjectExpression":
      parsedExp.properties = parseObject(exp.properties, meta, programScript)
      break
    case "VariableDeclaration":
      const vars = parseVariableDeclaration(exp, meta, programScript)
      parsedExp = vars.map((v) => ({
        ...parsedExp,
        ...v,
      }))
      break
    case "BlockStatement":
      parsedExp.body = exp.body.map((e) => parseExp(e, meta, programScript))
      break
    case "ReturnStatement":
      parsedExp.body = parseExp(exp.argument, meta, programScript)
      break
    case "BinaryExpression":
      parsedExp.operator = exp.operator
      parsedExp.left = parseExp(exp.left, meta, programScript)
      parsedExp.right = parseExp(exp.right, meta, programScript)
      break
    case "AssignmentExpression":
      parsedExp.operator = exp.operator
      parsedExp.left = parseExp(exp.left, meta, programScript)
      parsedExp.right = parseExp(exp.right, meta, programScript)
      break
    case "ExpressionStatement":
      parsedExp.expression = parseExp(exp.expression, meta, programScript)
      break
    case "CallExpression":
      parsedExp.callee = parseExp(exp.callee, meta, programScript)
      parsedExp.arguments = exp.arguments.map((a) =>
        parseExp(a, meta, programScript)
      )
      break
    case "MemberExpression":
      parsedExp.object = parseExp(exp.object, meta, programScript)
      parsedExp.property = parseExp(exp.property, meta, programScript)
      break
    case "FunctionDeclaration":
      parsedExp.identifier = exp.id.name
      parsedExp.params = exp.params.map((p) => p.name)
      parsedExp.body = parseExp(exp.body, meta, programScript)
      parsedExp.isAsync = exp.async
      parsedExp.isGenerator = exp.generator
      break
    case "FunctionExpression":
      break
    case "ArrowFunctionExpression":
      break
    // TODO: Complete remaining expressions
    default:
      // console.log(exp)
      parsedExp = {}
      break
  }
  return parsedExp
}

function parseArray(elements, meta, programScript) {
  const parsedElements = []
  elements.forEach((element) => {
    const parsedElement = {
      type: getExpType(element),
      value: parseExp(element, meta, programScript),
    }
    parsedElements.push(parsedElement)
  })
  return parsedElements
}

function parseObject(properties, meta, programScript) {
  const parsedProperties = []
  properties.forEach((p) => {
    const parsedProperty = {
      type: getExpType(p.value),
      identifier: p.key.name,
      value: parseExp(p.value, meta, programScript),
    }
    parsedProperties.push(parsedProperty)
  })
  return parsedProperties
}

function parseVariableDeclaration(node, meta, programScript) {
  const vars = []
  let declarations = node.declarations
  declarations.forEach((d) => {
    const declarationsData = declarations[declarations.length - 1].init
    let newVar = {
      keyword: node.kind,
      identifier: d.id.name,
      // type: getExpType({ ...declarationsData }),
      value: parseExp({ ...declarationsData }, meta, programScript), // Recursively parse expression
    }
    vars.push(newVar)
  })
  return vars
}

function addVarToEnv(newVar, env) {
  env[newVar.identifier] = newVar
  return env
}

function getVariable(variable, env) {
  if (env.hasOwnProperty(variable)) {
    return env[variable]
  } else return undefined // or raise error?
}

function getExpScript(programScript, start, end) {
  const expScript = `${programScript.substring(start, end)}\n`
  return expScript
}

// State
let globals = {}
const AST = {
  start: 0,
  // end: ,
  script: programScript,
  type: "program",
  children: [],
}

esprima.parseScript(programScript, { comment: true }, function (node, meta) {
  // if (node.type !== "Identifier" && node.type !== "VariableDeclarator") {
  if (node.type === "Program") {
    node.body.forEach((c) => {
      const childNode = parseExp(c, meta, programScript)
      if (Array.isArray(childNode)) {
        // SIDE EFFECTS!!!
        AST.children.push(...childNode)
      } else Object.keys(childNode).length !== 0 && AST.children.push(childNode)
    })
  }
})

printAst(AST)
//const bar = [{baz: true, arr: [1,2,3]}, 42]
// globals.bar.value.forEach((e) => {
//   if (e.type === "ObjectExpression") console.log(e.properties)
//   if (e.type === "ArrayExpression") console.log(e.elements)
//   else console.log(e)
// })
// console.log(globals.bar.elements[1].elements.forEach((e) => console.log(e)))
