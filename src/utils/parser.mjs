import esprima from "esprima"

var programScript = `
// this is a comment
let y, z = 2
function addOne (x) {
  return x + 1
}
var foo = "a"
y = 1
console.log('hello world')
const bar = [{baz: true}]

function addTwo (x) {
  return x + 2
}`

function parseLiteral(variableValueObj) {
  return variableValueObj.value
}

function getVariableValue(variableValueObj) {
  let value = null
  switch (variableValueObj.type) {
    case "Literal":
      value = parseLiteral(variableValueObj)
      break
    case "ArrayExpression":
      value = parseArray(variableValueObj.elements)
      break
    case "ObjectExpression":
      value = parseObject(variableValueObj.properties)
      break
    case "FunctionExpression" ||
      "FunctionDeclaration" ||
      "ArrowFunctionExpression":
      value = parseFunction(variableValueObj)
      break
  }
  return value
}
// State
let globals = []
let globalsScript = ""

const AST = esprima.parseScript(
  programScript,
  { comment: true },
  function (node, meta) {
    if (node.type === "VariableDeclaration") {
      // Put logic for parsing variables in parseVariables
      let declarations = node.declarations
      declarations.forEach((d) => {
        let newGlobal = {
          start: meta.start.offset,
          end: meta.end.offset,
          keyword: node.kind,
          identifier: d.id.name,
          // type: declarations[declarations.length - 1].init.type,
          ...declarations[declarations.length - 1].init,
        }
        let newGlobalValueObj = {
          ...declarations[declarations.length - 1].init,
        }
        // SIDE EFFECTS!!!
        globals.push(newGlobal)
        const gDeclarationScript = `${programScript.substring(
          globals[0].start,
          globals[0].end
        )}\n`
        globalsScript += gDeclarationScript
      })
    }
  }
)

// console.log(globals)
console.log(
  globals[3].elements.forEach((e) => {
    console.log(e)
  })
)
