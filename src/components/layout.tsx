import { BreadcrumbItem, Breadcrumb, BreadcrumbSeparator, BreadcrumbLink } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { ReactNode, useState } from 'react'
import { useBreadcrumb } from '../lib/breadcrumb'
import { getData } from '../lib/fetch'
import { Course } from '../types/api'
import Header from './header'
import Loader from './loader'
import Sidebar from './sider'

export function CourseLayout(props: { isSuccess: boolean; children: ReactNode }) {
  const router = useRouter()
  const { data } = useQuery(
    ['courses', router.query.course],
    async () => await getData<Course>('courses/' + router.query.course)
  )
  const [width, setWidth] = useState(0)

  return (
    <div
      className="h-screen grid flex-col course-layout"
      style={{ gridTemplateColumns: `${width}px 1fr`, gridTemplateRows: '6rem 1fr' }}
    >
      <Header text={data?.name} />

      <Sidebar sidebarWidth={width} setSidebarWidth={setWidth} />
      <div className="bg overflow-scroll" style={{ gridArea: 'main' }}>
        <BreadcrumbElement />
        {props.isSuccess ? props.children : <Loader />}
      </div>
    </div>
  )
}

function BreadcrumbElement() {
  const breadcrumb = useBreadcrumb()

  return (
    <Breadcrumb pl="6" pt="6" className="text-zinc-400">
      {breadcrumb.map((item, index) => (
        <BreadcrumbItem key={index}>
          <Link href={item.url}>
            <span className="cursor-pointer hover:text-sky-400 transition !text-zinc-200">
              {item.name}
            </span>
          </Link>
        </BreadcrumbItem>
      ))}
    </Breadcrumb>
  )
}
