import { useEffect, useState } from 'react'
import Header from '../components/header'
import Loader from '../components/loader'
import modules from '../lib/modules'

export type Type = 'dashboard' | 'modules'

interface State {
  type: Type
  url: string
}

export default function Main() {
  const [state, setState] = useState<State>({
    type: 'dashboard',
    url: 'dashboard/dashboard_cards',
  })

  const [data, setData] = useState<{ [key: string]: any }>(undefined)

  useEffect(() => {
    // FIXME: add abort
    window.electronAPI.getData(state.url).then(data => setData(data))
  }, [state.url, state.type])

  console.log(data)

  return (
    <div>
      <Header />

      <main>
        {data != undefined ? (
          modules
            .filter(element => !(state.type in element.types))
            .map(element => element.element(data))
        ) : (
          <Loader />
        )}
      </main>
    </div>
  )
}
