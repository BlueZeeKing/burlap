import Link from 'next/link'
import Header from '../components/header'
import Loader from '../components/loader'

import { useMutation, useQuery } from '@tanstack/react-query'

import { getData } from '../lib/fetch'
import { queryClient } from './_app'
import { Page, Course, Module, Assignment, Tab, DashboardCourse } from '../types/api'
import PrefetchWrapper from '../components/prefetcher'
import { LinkBox, LinkOverlay } from '@chakra-ui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGripVertical } from '@fortawesome/free-solid-svg-icons'
import { MutableRefObject, useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Body, fetch } from '@tauri-apps/api/http'
import { getKey } from '../lib/auth'

const MotionLinkBox = motion(LinkBox)

export default function App() {
  const { data, isSuccess } = useQuery(
    ['dashboard'],
    async () => await getData<DashboardCourse[]>('dashboard/dashboard_cards')
  )

  return (
    <div>
      <Header />

      {isSuccess ? <AppView data={data} /> : <Loader />}
    </div>
  )
}

interface MovingCourseData {
  id: string
  x: number
  y: number
  width: number
  height: number
  offsetX: number
  offsetY: number
}

function AppView(props: { data: DashboardCourse[] }) {
  const [movingCourse, setMovingCourse] = useState<MovingCourseData | undefined>()
  const ref = useRef<HTMLDivElement>(null)
  const [order, setOrder] = useState<string[]>(props.data.map(item => item.assetString))

  const mutation = useMutation(async (order: string[]) => {
    // FIXME: creates 500 error
    const key = await getKey()
    const res = await fetch(
      'https://apsva.instructure.com/api/v1/users/self/dashboard_positions/',
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${key}`,
          'content-type': 'application/json;charset=UTF-8',
        },
        body: Body.json(
          Object.assign(
            {},
            ...order.map((item, index) => ({
              [`dashboard_positions[${item}]`]: index,
            }))
          )
        ),
      }
    )

    console.log(res.status)
  })

  const move = (index: number, id: string) => {
    let copy: string[] = JSON.parse(JSON.stringify(order))

    copy.splice(copy.indexOf(id), 1)
    copy.splice(index, 0, id)

    setOrder(copy)
  }

  //console.log(mutation.status)

  return (
    <main
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 bg gap-6 p-6 w-screen"
      ref={ref}
    >
      {props.data
        .sort((a, b) => order.indexOf(a.assetString) - order.indexOf(b.assetString))
        .map(item => (
          <CourseItem
            key={item.id}
            item={item}
            setMovingCourse={setMovingCourse}
            clicked={item.assetString == movingCourse?.id}
          />
        ))}
      {movingCourse ? (
        <MovingCourseItem
          gridRef={ref}
          setMovingCourse={setMovingCourse}
          item={props.data.find(item => item.assetString == movingCourse.id)}
          data={movingCourse}
          update={move}
          onComplete={() => {
            mutation.mutate(order)
          }}
        />
      ) : (
        ''
      )}
    </main>
  )
}

function CourseItem(props: {
  item: DashboardCourse
  // eslint-disable-next-line unused-imports/no-unused-vars
  setMovingCourse: (a: MovingCourseData) => void
  clicked: boolean
}) {
  const { item, setMovingCourse } = props
  const ref = useRef<HTMLDivElement>(null)

  return (
    <MotionLinkBox layout key={item.id} as="article">
      <PrefetchWrapper prefetch={() => prefetch(item)} className="h-full">
        <div
          className={`h-40 p-8 bg-white dark:bg-zinc-800 rounded border-zinc-300 dark:border-zinc-700 border cursor-pointer relative set-opacity-wrapper ${
            props.clicked ? 'opacity-50' : 'opacity-100'
          }`}
          ref={ref}
        >
          <div
            onMouseDown={e => {
              const { left, top, width, height } = ref.current.getBoundingClientRect()
              setMovingCourse({
                id: item.assetString,
                x: left,
                y: top,
                width: width,
                height: height,
                offsetX: e.clientX - left,
                offsetY: e.clientY - top,
              })
              pauseEvent(e)
            }}
            className={`${
              props.clicked ? '' : 'set-opacity'
            } absolute z-50 left-3 top-[50%] -translate-y-[50%] opacity-0 transition-opacity ${
              props.clicked ? 'cursor-grabbing' : 'cursor-grab'
            }`}
          >
            <FontAwesomeIcon icon={faGripVertical} className="text-zinc-600" />
          </div>
          <h2 className={`text-xl flex flex-row ${props.clicked ? 'opacity-0' : 'opacity-100'}`}>
            <Link href={`/courses/${item.id}`} passHref>
              <LinkOverlay>{item.shortName}</LinkOverlay>
            </Link>
          </h2>
          <p
            className={`text-sm text-zinc-500 dark:text-zinc-400 ${
              props.clicked ? 'opacity-0' : 'opacity-100'
            }`}
          >
            {item.courseCode}
          </p>
        </div>
      </PrefetchWrapper>
    </MotionLinkBox>
  )
}

const formatTemplateList = (a: string) => {
  return a
    .replaceAll('px', '')
    .split(' ')
    .map(i => parseInt(i))
}

function MovingCourseItem(props: {
  item: DashboardCourse
  data: MovingCourseData
  // eslint-disable-next-line unused-imports/no-unused-vars
  setMovingCourse: (a: undefined) => void
  // eslint-disable-next-line unused-imports/no-unused-vars
  update: (index: number, id: string) => void
  onComplete: () => void
  gridRef: MutableRefObject<HTMLDivElement>
}) {
  const [pos, setPos] = useState<[number, number]>([props.data.x, props.data.y])
  const getRowsColumns = useCallback(() => {
    let compStyle = getComputedStyle(props.gridRef.current)
    //console.log("compute")
    return [
      formatTemplateList(compStyle.getPropertyValue('grid-template-rows')),
      formatTemplateList(compStyle.getPropertyValue('grid-template-columns')),
    ]
  }, [props.gridRef])

  useEffect(() => {
    const mouseMoveHandler = e => {
      pauseEvent(e)
      let newPos: [number, number] = [
        e.clientX - props.data.offsetX,
        e.clientY - props.data.offsetY,
      ]
      if (e.movementX ** e.movementX + e.movementY ** e.movementY <= 2) {
        const { top, left } = props.gridRef.current.getBoundingClientRect()
        const [rows, columns] = getRowsColumns()
        props.update(
          rows.findIndex((value, index) => value * (index + 1) > newPos[1] - top) * columns.length +
            columns.findIndex((value, index) => value * (index + 1) > newPos[0] - left),
          props.data.id
        )
      }
      setPos(newPos)
    }

    const mouseUpHandler = () => {
      props.onComplete()
      props.setMovingCourse(undefined)
    }

    window.addEventListener('mousemove', mouseMoveHandler)
    window.addEventListener('mouseup', mouseUpHandler)

    return () => {
      window.removeEventListener('mousemove', mouseMoveHandler)
      window.removeEventListener('mouseup', mouseUpHandler)
    }
  })

  return (
    <div
      style={{
        top: pos[1],
        left: pos[0],
        width: props.data.width,
        height: props.data.height,
      }}
      className="p-8 bg-white dark:bg-zinc-800 rounded border-zinc-300 dark:border-zinc-700 border cursor-pointer fixed set-opacity-wrapper"
    >
      <div className="set-opacity absolute z-50 left-3 top-[50%] -translate-y-[50%] opacity-0 transition-opacity cursor-grabbing">
        <FontAwesomeIcon icon={faGripVertical} className="text-zinc-600" />
      </div>
      <h2 className="text-xl flex flex-row">{props.item.shortName}</h2>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{props.item.courseCode}</p>
    </div>
  )
}

const prefetch = (item: DashboardCourse) => {
  const course: Course = {
    course_code: item.courseCode,
    name: item.shortName,
    id: item.id,
    default_view: item.defaultView,
    syllabus_body: '',
  }

  queryClient.setQueryData(['courses', course.id.toString()], course)

  queryClient.prefetchQuery(['courses', course.id.toString(), 'tabs'], async () =>
    getData<Tab[]>(`courses/${course.id}/tabs`)
  )

  prefectDefaultView(course)
}

export function prefectDefaultView(item: Course) {
  switch (item.default_view) {
    case 'wiki':
      queryClient.prefetchQuery(['courses', item.id.toString(), 'front_page'], async () =>
        getData<Page>(`courses/${item.id}/front_page`)
      )
      return
    case 'modules':
      queryClient.prefetchQuery(['courses', item.id.toString(), 'modules'], async () =>
        getData<Module[]>(`courses/${item.id}/modules?include=items`)
      )
      return
    case 'assignments':
      queryClient.prefetchQuery(['courses', item.id.toString(), 'assignments'], async () =>
        getData<Assignment[]>(`courses/${item.id}/assignments`)
      )
      return
    case 'syllabus':
      queryClient.prefetchQuery(['courses', item.id.toString(), 'syllabus'], async () =>
        getData<Module[]>(`courses/${item.id}?include=syllabus_body`)
      )
      return
  }
}

function pauseEvent(e) {
  if (e.stopPropagation) e.stopPropagation()
  if (e.preventDefault) e.preventDefault()
  e.cancelBubble = true
  e.returnValue = false
  return false
}
