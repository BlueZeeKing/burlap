import { ReactNode, createContext, useContext } from 'react'

export type Type =
  | 'dashboard'
  | 'wiki'
  | 'assignment'
  | 'discussion'
  | 'file'
  | 'modules'
  | 'page'
  | 'quiz'
  | 'unknown'

export interface State {
  type: Type
  url: string
  course?: number
  sidebar?: boolean
}

const RouteContext = createContext<{ state: State; setRoute: (_state: State) => void }>({
  state: {
    type: 'dashboard',
    url: 'dashboard/dashboard_cards',
  },
  setRoute: (_state: State) => {},
})

export function useRouter() {
  return useContext(RouteContext)
}

export const Provider = RouteContext.Provider
