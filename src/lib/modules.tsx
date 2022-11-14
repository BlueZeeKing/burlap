import Dashboard from '../modules/dashboard'
import { Wiki } from '../modules/wiki'
import { Type } from '../lib/context'
import { DashboardCourse, Page } from '../types'
import { nanoid } from 'nanoid'

interface Module {
  types: Type[]
  // eslint-disable-next-line unused-imports/no-unused-vars
  element: (data: { [key: string]: any }) => JSX.Element
  id: string
  width: number
  height: number
}

const modules: Module[] = [
  {
    element: data => <Dashboard data={data as DashboardCourse[]} key="blueish:dashboard" />,
    types: ['dashboard'],
    id: 'blueish:dashboard',
    width: 10,
    height: 12,
  },
  {
    element: data => <Wiki data={data as Page} key="blueish:wiki" />,
    types: ['wiki'],
    id: 'blueish:wiki',
    width: 6,
    height: 8,
  },
]

export default modules
