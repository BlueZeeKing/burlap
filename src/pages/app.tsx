import '../global.css'
import ReactDOM from 'react-dom/client'

import { ChakraProvider } from '@chakra-ui/react'
import Start from './start'
import { useEffect, useState } from 'react'
import { getKey } from '../lib/auth'

function Main() {
  const [isLoggedIn, setLoggedIn] = useState(true)

  useEffect(() => {
    getKey().then(data => setLoggedIn(data != undefined))
  }, [])

  return (
    <ChakraProvider>
      {isLoggedIn ? <h1>hi</h1> : <Start onComplete={() => setLoggedIn(true)} />}
    </ChakraProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(<Main />)
