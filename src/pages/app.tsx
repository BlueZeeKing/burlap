import '../global.css'
import ReactDOM from 'react-dom/client'

import { ChakraProvider } from '@chakra-ui/react'
import Start from './start'
import { useEffect, useState } from 'react'
import { getKey } from '../lib/auth'
import Main from './main'

function App() {
  const [isLoggedIn, setLoggedIn] = useState(true)

  useEffect(() => {
    getKey().then(data => setLoggedIn(data != undefined))
  }, [])

  return (
    <ChakraProvider>
      {isLoggedIn ? <Main /> : <Start onComplete={() => setLoggedIn(true)} />}
    </ChakraProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />)
