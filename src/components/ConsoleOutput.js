import React, { useState, useEffect } from "react"

const ConsoleOutput = ({ output }) => {
  const [outputState, setOutputState] = useState("")
  return (
    <div className="console">
      <pre>{output}</pre>
    </div>
  )
}

export default ConsoleOutput
