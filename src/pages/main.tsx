import { useEffect, useState } from 'react'
import Header from '../components/header'
import Loader from '../components/loader'
import { Provider, State } from '../lib/context'
import modules from '../lib/modules'

export default function Main() {
  const [state, setState] = useState<State>({
    type: 'dashboard',
    url: 'dashboard/dashboard_cards',
  })

  function setAndClearState(state: State) {
    setState(state)
    setData(undefined)
  }

  const [data, setData] = useState<{ [key: string]: any }>(undefined)

  useEffect(() => {
    // FIXME: add abort
    window.electronAPI.getData(state.url).then(data => setData(data))
  }, [state.url, state.type])

  console.log(data)

  return (
    <Provider value={setAndClearState}>
      <div>
        <Header />
        <main>
          {data != undefined ? (
            modules
              .filter(element => element.types.includes(state.type))
              .map(element => element.element(data))
          ) : (
            <Loader />
          )}
        </main>
      </div>
    </Provider>
  )
}
