import { useEffect, useMemo, useRef, useState } from 'react'
import Header from '../components/header'
import Loader from '../components/loader'
import Sidebar from '../components/sider'
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

  const elements = useMemo(
    () => modules.filter(element => element.types.includes(state.type)),
    [state.type]
  )

  useEffect(() => {
    // FIXME: add abort
    window.electronAPI.getData(state.url).then(data => setData(data))
  }, [state.url, state.type])

  const ref = useRef<HTMLDivElement>(null)

  console.log(data)

  return (
    <Provider value={{ state: state, setRoute: setAndClearState }}>
      <div className="h-screen">
        <Header />
        <main className="h-full mt-24 flex" ref={ref}>
          {state.sidebar ? <Sidebar /> : null}
          {data != undefined ? (
            elements.map(element => <div key={element.id}>{element.element(data)}</div>)
          ) : (
            <Loader />
          )}
        </main>
      </div>
    </Provider>
  )
}
