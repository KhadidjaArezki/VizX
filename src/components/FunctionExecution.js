// @ts-check
import React, { useState, useEffect } from "react"

const FunctionExecution = ({ fScript }) => {
  const [executionState, setExecutionState] = useState({})
  return (
    <>
      <pre>{fScript}</pre>
    </>
  )
}

export default FunctionExecution
