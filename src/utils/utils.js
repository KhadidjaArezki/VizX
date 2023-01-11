//// @ts-check
import esprima from "esprima"

function printAst(ast) {
  console.log(JSON.stringify(ast, null, 4))
}

function isFunction(node) {
  return (
    node.type === "FunctionDeclaration" ||
    node.type === "FunctionExpression" ||
    node.type === "ArrowFunctionExpression"
  )
}

function isCalledFunction(node, functionName) {
  return node.id.name === functionName
}

export function getFunction(programScript, functionName) {
  let functionScript = ""
  let programAst = esprima.parseScript(
    programScript,
    { comment: true },
    function (node, meta) {
      if (isFunction(node) && isCalledFunction(node, functionName)) {
        functionScript += `${programScript.substring(
          meta.start.offset,
          meta.end.offset
        )}`
      }
    }
  )
  return functionScript
}

export function replaceParamsWithArgs(fScript, { functionName, functionArgs }) {
  //Search for the offset of params in fScript and then replace them with args
  let params_start = fScript.indexOf("(") + 1
  let params_end = fScript.indexOf(")")
  let functionParams = fScript.substring(params_start, params_end)
  functionParams
    .replace(/\s+/g, "")
    .split(",")
    .forEach((param, index) => {
      functionParams = functionParams.replace(param, functionArgs[index])
    })
  return (
    fScript.substring(0, params_start) +
    functionParams +
    fScript.substring(params_end, fScript.length)
  )
}
// TODO: write a function replace each
// variable in next line with its value

export function getFunctionExecutionState(functionName, functionArgs) {
  return {
    functionName: functionName,
    functionScript: getFunction(programScript, functionName),
  }
}

// Create a script containing function declarations and expressions only
export function getAllFunctions(script) {
  let functions = []
  let functionsScript = ""
  let programAst = esprima.parseScript(
    script,
    { comment: true },
    function (node, meta) {
      if (isFunction(node)) {
        functions.push({
          start: meta.start.offset,
          end: meta.end.offset,
        })
      }
    }
  )

  functions
    .sort((a, b) => {
      return b.end - a.end
    })
    .forEach((f) => {
      functionsScript += `${programScript.substring(f.start, f.end)}\n`
    })
  return functionsScript
}

export function getMainObj(mainCallScript) {
  let mainCallAst = esprima.parseScript(mainCallScript, { comment: true })
  let consoleCallArgs = mainCallAst.body[0].expression.arguments[0]
  return {
    functionName: consoleCallArgs.callee.name,
    functionArgs: consoleCallArgs.arguments.map((arg) => arg.value),
  }
}

var programScript = `
// this is a comment
let y = 2
function addOne (x) {
  return x + 1
}
console.log('hello world')
function addTwo (x) {
  return x + 2
}`

var mainCallScript = `console.log(addOne(1))`

// Parse mainCallScript to get called function and its args
// get the script of the called function
// produce a new script of the function with its
// params replaced with arguments values
function main() {
  let mainCallObj = getMainObj(mainCallScript)
  console.log(mainCallObj)
  // printAst(mainCallAst)

  // console.log(getAllFunctions(programScript))
  let calledFunction = getFunction(programScript, mainCallObj.functionName)
  // console.log(calledFunction)
  console.log(replaceParamsWithArgs(calledFunction, mainCallObj))
}

// main()
// console.log(ast.body.map((token) => console.log(token.type)))
