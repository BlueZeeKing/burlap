import { IconButton, useDisclosure } from '@chakra-ui/react'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { NextRouter, useRouter } from 'next/router'
import { useEffect } from 'react'
import { getData, getInfiniteData } from '../lib/fetch'
import { queryClient } from '../pages/app'
import { Tab, Module, Assignment, Announcement, Discussion } from '../types'
import PrefetchWrapper from './prefetcher'
import Resizer from './resizer'

export default function Sidebar(props: {
  sidebarWidth: number
  // eslint-disable-next-line unused-imports/no-unused-vars
  setSidebarWidth: (a: number) => void
}) {
  const { sidebarWidth, setSidebarWidth } = props

  const router = useRouter()

  const { data } = useQuery(
    ['courses', router.query.course, 'tabs'],
    async () => await getData<Tab[]>(`courses/${router.query.course}/tabs`)
  )

  const { isOpen, onOpen, onClose } = useDisclosure()
  const previewView = useDisclosure()

  useEffect(() => {
    if (
      window.localStorage.getItem('sidebar-open') != null &&
      window.localStorage.getItem('sidebar-open') == 'true'
    ) {
      onOpen()
      if (window.localStorage.getItem('sidebar-width') != null) {
        let data = parseInt(window.localStorage.getItem('sidebar-width'))
        setSidebarWidth(data)
      }
    }
  }, [onOpen, setSidebarWidth])

  useEffect(() => {
    window.localStorage.setItem('sidebar-open', isOpen.toString())
  }, [isOpen])

  return (
    <div className="grid col-span-1 row-span-1" style={{ gridArea: 'sider' }}>
      {isOpen ? (
        <SiderInterior
          data={data}
          sidebarWidth={sidebarWidth}
          router={router}
          isResizable={true}
          handleWidth={width => {
            if (width < 80) {
              onClose()
              setSidebarWidth(0)
            } else {
              setSidebarWidth(width)
              window.localStorage.setItem('sidebar-width', width.toString())
            }
          }}
        />
      ) : (
        <>
          <div
            className="h-[600px] fixed w-14 top-[50%] left-0 -translate-y-[50%] z-50"
            onMouseEnter={previewView.onOpen}
          ></div>
          <div className="fixed bottom-0 left-0 p-3 z-50">
            <IconButton
              onClick={() => {
                setSidebarWidth(200)
                onOpen()
              }}
              aria-label="Open sidebar"
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </IconButton>
          </div>
          {previewView.isOpen ? (
            <div className="fixed top-[50%] left-0 -translate-y-[50%] h-[600px] z-50">
              <SiderInterior
                data={data}
                sidebarWidth={250}
                router={router}
                isResizable={false}
                onExit={previewView.onClose}
                className="overflow-y-scroll h-[600px] rounded-r shadow"
                handleWidth={() => {}}
              />
            </div>
          ) : (
            ''
          )}
        </>
      )}
    </div>
  )
}

function SiderInterior(props: {
  sidebarWidth: number
  router: NextRouter
  data: Tab[]
  isResizable: boolean
  className?: string
  onExit?: () => void
  // eslint-disable-next-line unused-imports/no-unused-vars
  handleWidth: (a: number) => void
}) {
  const { sidebarWidth, router, handleWidth, data, isResizable, className, onExit } = props

  return (
    <aside
      className={
        'bg-zinc-100 dark:bg-zinc-700 relative select-none overflow-x-hidden ' +
        (className ? className : '')
      }
      style={{ width: sidebarWidth, flexBasis: sidebarWidth }}
      onMouseLeave={onExit}
    >
      {data
        ?.sort(item => item.position)
        .map(item => (
          <PrefetchWrapper prefetch={() => getPrefetch(router, item)} key={item.id}>
            <Link href={getURL(item)}>
              <p
                className={`pl-4 py-2 m-2 hover:bg-sky-400 hover:bg-opacity-[0.15] cursor-pointer rounded-lg whitespace-nowrap overflow-x-hidden ${
                  router.asPath == getURL(item) ? 'bg-sky-400 !bg-opacity-30' : ''
                }`}
              >
                {item.label}
              </p>
            </Link>
          </PrefetchWrapper>
        ))}
      {isResizable ? <Resizer width={sidebarWidth} setWidth={handleWidth} /> : ''}
    </aside>
  )
}

function getURL(data: Tab) {
  if (data.type == 'internal') {
    switch (data.id) {
      default:
        return data.html_url
    }
  } else {
    return '/404'
  }
}

const getPrefetch = (router: NextRouter, tab: Tab) => {
  switch (tab.id) {
    case 'modules':
      queryClient.prefetchInfiniteQuery(
        ['courses', router.query.course, 'modules'],
        async ({
          pageParam = `https://apsva.instructure.com/api/v1/courses/${router.query.course}/modules`,
        }) => await getInfiniteData<Module[]>(pageParam)
      )
      break
    case 'announcements':
      queryClient.prefetchInfiniteQuery(
        ['courses', router.query.course, 'announcements'],
        async ({
          pageParam = `https://apsva.instructure.com/api/v1/courses/${router.query.course}/discussion_topics?only_announcements=true`,
        }) => await getInfiniteData<Announcement[]>(pageParam)
      )
      break
    case 'assignments':
      queryClient.prefetchInfiniteQuery(
        ['courses', router.query.course, 'assignments'],
        async ({
          pageParam = `https://apsva.instructure.com/api/v1/courses/${router.query.course}/assignments`,
        }) => await getInfiniteData<Assignment[]>(pageParam)
      )
      break
    case 'discussion_topics':
      queryClient.prefetchQuery(['courses', router.query.course, 'discussions'], async () =>
        getData<Discussion[]>(`courses/${router.query.course}/discussion_topics`)
      )
      break
  }
}
