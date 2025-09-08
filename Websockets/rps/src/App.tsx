import { useState } from "react"
import Login from "./elements/Login"
import Chooser from "./elements/Chooser"
import { Toaster } from "./components/ui/sonner"


function App() {

  const [username, setUsername] = useState<string>()

  return (
    <>
    {username?       
      <Chooser username={username}></Chooser>:
      
      <Login setUsername={setUsername}></Login>
    }
    <Toaster></Toaster>
    </>
  )
}

export default App
