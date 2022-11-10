import { ReactNode, createContext, useContext } from 'react'

export type Type = 'dashboard' | 'wiki'

export interface State {
  type: Type
  url: string
}

const RouteContext = createContext((_state: State) => {})

export function useRouter() {
  return useContext(RouteContext)
}

export const Provider = RouteContext.Provider
