// @ts-check
import React, { useState, useEffect } from "react"
import "./index.css"
import FunctionExecution from "./components/FunctionExecution.js"
import ConsoleOutput from "./components/ConsoleOutput.js"
import MainProgram from "./components/MainProgram.js"
import { getMainObj, getFunction } from "./utils/utils.js"

const programScript = `
// this is a comment
function addOne (x) {
  return x + 1
}
console.log('hello world')
function addTwo (x) {
  return x + 2
}`

const mainCallScript = `console.log(addOne(1))`
let mainCallObj = getMainObj(mainCallScript)
const fScript = getFunction(programScript, mainCallObj.functionName)
const output = ""

const App = () => {
  return (
    <>
      <p>Welcome to VizX</p>
      <div className="container">
        <div className="code">
          <FunctionExecution fScript={fScript} />
          <MainProgram script={mainCallScript} />
        </div>
        <button>Previous</button>
        <button>Next</button>
        <ConsoleOutput output={output} />
      </div>
    </>
  )
}

export default App
