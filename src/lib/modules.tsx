import Dashboard from '../pages'
import { Type } from '../pages/main'
import { DashboardCourse } from '../types'

interface Module {
  types: Type[]
  // eslint-disable-next-line unused-imports/no-unused-vars
  element: (data: { [key: string]: any }) => JSX.Element
}

const modules: Module[] = [
  {
    element: data => <Dashboard data={data as DashboardCourse[]} />,
    types: ['dashboard'],
  },
]

export default modules
