import { Box, IconButton, useDisclosure } from '@chakra-ui/react'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useState } from 'react'
import { State, useRouter } from '../lib/context'
import { Tab } from '../types'
import PrefetchWrapper from './prefetcher'
import Resizer from './resizer'

export default function Sidebar() {
  const [sidebarWidth, setSidebarWidth] = useState(200)

  const { state, setRoute } = useRouter()

  const [data, setData] = useState<Tab[]>(undefined)

  useEffect(() => {
    window.electronAPI.getData(`courses/${state.course}/tabs`).then(data => setData(data))
  })

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
          isResizable={true}
          setRoute={setRoute}
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
                setRoute={setRoute}
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
  setRoute: (state: State) => void
  data: Tab[]
  isResizable: boolean
  className?: string
  onExit?: () => void
  handleWidth: (_a: number) => void
}) {
  const { sidebarWidth, setRoute, handleWidth, data, isResizable, className, onExit } = props

  return (
    // FIXME: Fix current route highlighting
    <Box
      as="aside"
      bg="gray.700"
      pos="relative"
      overflowX="hidden"
      width={sidebarWidth + 'px'}
      boxShadow="lg"
      flexBasis={sidebarWidth + 'px'}
      className={className}
      onMouseLeave={onExit}
    >
      {data
        ?.sort(item => item.position)
        .map(item => (
          <PrefetchWrapper prefetch={() => {}} key={item.id}>
            <a onClick={() => {}}>
              <p
                className={`pl-4 py-2 m-2 hover:bg-sky-400 hover:bg-opacity-[0.15] cursor-pointer rounded-lg whitespace-nowrap overflow-x-hidden ${
                  false ? 'bg-sky-400 !bg-opacity-30' : ''
                }`}
              >
                {item.label}
              </p>
            </a>
          </PrefetchWrapper>
        ))}
      {isResizable ? <Resizer width={sidebarWidth} setWidth={handleWidth} /> : ''}
    </Box>
  )
}

function getURL(data: Tab) {
  console.log(data.id)
  if (data.type == 'internal') {
    switch (data.id) {
      default:
        return data.html_url
    }
  } else {
    return '/404'
  }
}

// const getPrefetch = (router: NextRouter, tab: Tab) => {
//   switch (tab.id) {
//     case 'modules':
//       queryClient.prefetchInfiniteQuery(
//         ['courses', router.query.course, 'modules'],
//         async ({
//           pageParam = `https://apsva.instructure.com/api/v1/courses/${router.query.course}/modules`,
//         }) => await getInfiniteData<Module[]>(pageParam)
//       )
//       break
//     case 'announcements':
//       queryClient.prefetchInfiniteQuery(
//         ['courses', router.query.course, 'announcements'],
//         async ({
//           pageParam = `https://apsva.instructure.com/api/v1/courses/${router.query.course}/discussion_topics?only_announcements=true`,
//         }) => await getInfiniteData<Announcement[]>(pageParam)
//       )
//       break
//     case 'assignments':
//       queryClient.prefetchInfiniteQuery(
//         ['courses', router.query.course, 'assignments'],
//         async ({
//           pageParam = `https://apsva.instructure.com/api/v1/courses/${router.query.course}/assignments`,
//         }) => await getInfiniteData<Assignment[]>(pageParam)
//       )
//       break
//     case 'discussion_topics':
//       queryClient.prefetchQuery(['courses', router.query.course, 'discussions'], async () =>
//         getData<Discussion[]>(`courses/${router.query.course}/discussion_topics`)
//       )
//       break
//   }
// }
