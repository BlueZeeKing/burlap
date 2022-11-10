import '../global.css'
import ReactDOM from 'react-dom/client'

import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import Start from './start'
import { useEffect, useState } from 'react'
import { getKey } from '../lib/auth'
import Main from './main'

const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: 'gray.900',
      },
    },
  },
})

function App() {
  const [isLoggedIn, setLoggedIn] = useState(true)

  useEffect(() => {
    getKey().then(data => setLoggedIn(data != undefined))
  }, [])

  return (
    <ChakraProvider theme={theme}>
      {isLoggedIn ? <Main /> : <Start onComplete={() => setLoggedIn(true)} />}
    </ChakraProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />)
