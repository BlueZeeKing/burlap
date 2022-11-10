import Dashboard from '../modules/dashboard'
import { Wiki } from '../modules/wiki'
import { Type } from '../lib/context'
import { DashboardCourse, Page } from '../types'

interface Module {
  types: Type[]
  // eslint-disable-next-line unused-imports/no-unused-vars
  element: (data: { [key: string]: any }) => JSX.Element
}

const modules: Module[] = [
  {
    element: data => <Dashboard data={data as DashboardCourse[]} key="1" />,
    types: ['dashboard'],
  },
  {
    element: data => <Wiki data={data as Page} key="2" />,
    types: ['wiki'],
  },
]

export default modules
