import { useDisclosure, Heading, Link, Box } from '@chakra-ui/react'
import {
  faChevronUp,
  faChevronDown,
  faLock,
  faPenRuler,
  faComment,
  faLink,
  faFile,
  faNewspaper,
  faSquareCheck,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import PrefetchWrapper from '../components/prefetcher'
import { useRouter } from '../lib/context'
import { parseDate } from '../lib/date'
import { Type, Module, Item } from '../types'

export function Modules(props: { data: Module[] }) {
  return (
    <main className="bg">
      {props.data.map(item => (
        <Module key={item.id} module={item} />
      ))}
    </main>
  )
}

function Module(props: { module: Module }) {
  const { isOpen, onToggle } = useDisclosure()

  return (
    <div>
      <div
        className="bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 border p-5 rounded cursor-pointer flex z-20 relative"
        onClick={onToggle}
      >
        <h2>{props.module.name}</h2>
        <div className="flex-grow"></div>
        <div className="grid content-center">
          <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} />
        </div>
      </div>
      {isOpen ? (
        <div className="bg-zinc-100 dark:bg-[#222224] -translate-y-1 z-10 relative pt-1 rounded-b mx-1">
          {props.module.items.map(item =>
            item.type == 'SubHeader' ? (
              <Heading
                cursor="pointer"
                p="4"
                pl={4 + item.indent * 4}
                key={item.id}
                as="h2"
                size="md"
              >
                {item.title}
              </Heading>
            ) : (
              <ItemView item={item} key={item.id} />
            )
          )}
        </div>
      ) : (
        ''
      )}
    </div>
  )
}

function ItemView(props: { item: Item }) {
  const { item } = props
  return (
    <PrefetchWrapper prefetch={() => {}}>
      <ItemWrapper data={item}>
        <div className="flex">
          <Box cursor="pointer" p="4" pl={4 + item.indent * 4} display="flex">
            <div className="grid content-center">
              <FontAwesomeIcon icon={getIcon(item.type)} className="pr-4 pl-2" />
            </div>
            <div>
              <span className="hover:underline">{item.title}</span>
              {item.content_details.due_at ? (
                <p className="text-zinc-400 text-xs">{parseDate(item.content_details.due_at)}</p>
              ) : (
                ''
              )}
            </div>
            {item.content_details.locked ? (
              <div className="grid content-center">
                <FontAwesomeIcon icon={faLock} className="px-2 text-zinc-400" size="xs" />
              </div>
            ) : (
              ''
            )}
          </Box>
        </div>
      </ItemWrapper>
    </PrefetchWrapper>
  )
}

function getIcon(type: Type) {
  switch (type) {
    case 'Assignment':
      return faPenRuler
    case 'Discussion':
      return faComment
    case 'ExternalTool':
      return faLink
    case 'ExternalUrl':
      return faLink
    case 'File':
      return faFile
    case 'Page':
      return faNewspaper
    case 'Quiz':
      return faSquareCheck
    case 'SubHeader':
      return undefined
  }
}

// function prefetch(item: Item, courseID: string) {
//   switch (item.type) {
//     case 'Assignment':
//       return queryClient.prefetchQuery(
//         ['courses', courseID, 'assignments', item.content_id.toString()],
//         async () =>
//           getData<Assignment>(
//             `courses/${courseID}/assignments/${item.content_id}?include=submission`
//           )
//       )
//     case 'Discussion':
//       return queryClient.prefetchQuery(
//         ['courses', courseID, 'discussions', item.content_id.toString()],
//         async () => getData<Discussion>(`courses/${courseID}/discussion_topics/${item.content_id}`)
//       )
//     case 'File':
//       return queryClient.prefetchQuery(
//         ['courses', courseID, 'file', item.content_id.toString()],
//         async () => await getData<File>(`courses/${courseID}/files/${item.content_id}`)
//       )
//     case 'Page':
//       return queryClient.prefetchQuery(['courses', courseID, 'pages', item.page_url], async () =>
//         getData<Page>(`courses/${courseID}/pages/${item.content_id}`)
//       )
//   }
// }

export function ItemWrapper(props: { children: JSX.Element; data: Item }): JSX.Element {
  const { children, data } = props
  const { state } = useRouter()

  switch (data.type) {
    case 'Assignment':
      return (
        <Link
          href={
            ['/courses', state.course, 'assignments', data.content_id].join('/') +
            `?moduleItem=${data.id}`
          }
        >
          {children}
        </Link>
      )
    case 'Discussion':
      return (
        <Link
          href={
            ['/courses', state.course, 'discussion_topics', data.content_id].join('/') +
            `?moduleItem=${data.id}`
          }
        >
          {children}
        </Link>
      )
    case 'ExternalTool':
      return <Link href="/">{children}</Link>
    case 'ExternalUrl':
      return (
        <a href={data.external_url} rel="noreferrer" target="_blank">
          {children}
        </a>
      )
    case 'File':
      return (
        <Link
          href={
            ['/courses', state.course, 'files', data.content_id].join('/') +
            `?moduleItem=${data.id}`
          }
        >
          {children}
        </Link>
      )
    case 'Page':
      return (
        <Link
          href={
            ['/courses', state.course, 'pages', data.page_url].join('/') + `?moduleItem=${data.id}`
          }
        >
          {children}
        </Link>
      )
    case 'Quiz':
      return <Link href="/">{children}</Link>
    case 'SubHeader':
      return children
  }
}
