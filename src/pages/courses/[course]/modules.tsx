import { useDisclosure, Heading, Box, Spinner } from '@chakra-ui/react'
import {
  faChevronDown,
  faChevronUp,
  faPenRuler,
  faFile,
  faLink,
  faNewspaper,
  faComment,
  faSquareCheck,
  faLock,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Link from 'next/link'

import { useInfiniteQuery } from '@tanstack/react-query'
import { NextRouter, useRouter } from 'next/router'

import { getData, getInfiniteData } from '../../../lib/fetch'
import { CourseLayout } from '../../../components/layout'

import { Module, Item, Type, Assignment, Discussion, Page } from '../../../types/api'
import { parseDate } from '../../../lib/date'
import PrefetchWrapper from '../../../components/prefetcher'
import { queryClient } from '../../_app'
import { useBreadcrumb } from '../../../lib/breadcrumb'
import InfiniteScroll from 'react-infinite-scroll-component'

export default function Modules() {
  const router = useRouter()

  const { data, fetchNextPage, hasNextPage, isSuccess } = useInfiniteQuery(
    ['courses', router.query.course, 'modules'],
    async ({
      pageParam = `https://apsva.instructure.com/api/v1/courses/${router.query.course}/modules`,
    }) => await getInfiniteData<Module[]>(pageParam),
    {
      getNextPageParam: (lastPage, _pages) => lastPage.nextParams,
    }
  )

  useBreadcrumb([1, 'Modules', router.asPath])

  return (
    <CourseLayout isSuccess={isSuccess}>
      <ModulesView
        data={data?.pages.flatMap(item => item.data)}
        fetchMore={fetchNextPage}
        hasMore={hasNextPage}
      />
    </CourseLayout>
  )
}

function ModulesView(props: { data: Module[]; fetchMore: () => void; hasMore: boolean }) {
  const router = useRouter()

  return (
    <main className="bg">
      <InfiniteScroll
        dataLength={props.data.length}
        next={props.fetchMore}
        hasMore={props.hasMore}
        loader={
          <div className="grid place-content-center">
            <Spinner colorScheme="blue" />
          </div>
        }
        className="p-6 flex flex-col space-y-6"
        endMessage={<p className="text-zinc-500 text-center">End of content</p>}
      >
        {props.data.map(item => (
          <Module router={router} key={item.id} module={item} />
        ))}
      </InfiniteScroll>
    </main>
  )
}

function Module(props: { module: Module; router: NextRouter }) {
  const { isOpen, onToggle } = useDisclosure()

  const { data, fetchNextPage, hasNextPage } = useInfiniteQuery(
    ['courses', props.router.query.course, 'modules', props.module.id.toString(), 'items'],
    async ({
      pageParam = `https://apsva.instructure.com/api/v1/courses/${props.router.query.course}/modules/${props.module.id}/items?include=content_details`,
    }) => await getInfiniteData<Item[]>(pageParam),
    {
      getNextPageParam: (lastPage, _pages) => lastPage.nextParams,
    }
  )

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
          <InfiniteScroll
            dataLength={data?.pages?.flatMap(item => item).length}
            next={fetchNextPage}
            hasMore={hasNextPage}
            loader={
              <div className="grid place-content-center">
                <Spinner colorScheme="blue" />
              </div>
            }
            className="p-6 flex flex-col space-y-6"
            endMessage={<p className="text-zinc-500 text-center">End of content</p>}
          >
            {data?.pages
              .flatMap(item => item.data)
              .map(item =>
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
                  <ItemView item={item} router={props.router} key={item.id} />
                )
              )}
          </InfiniteScroll>
        </div>
      ) : (
        ''
      )}
    </div>
  )
}

function ItemView(props: { item: Item; router: NextRouter }) {
  const { item, router } = props
  return (
    <PrefetchWrapper prefetch={() => prefetch(item, router.query.course as string)}>
      <ItemWrapper data={item} router={router}>
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

function prefetch(item: Item, courseID: string) {
  switch (item.type) {
    case 'Assignment':
      return queryClient.prefetchQuery(
        ['courses', courseID, 'assignments', item.content_id.toString()],
        async () =>
          getData<Assignment>(
            `courses/${courseID}/assignments/${item.content_id}?include=submission`
          )
      )
    case 'Discussion':
      return queryClient.prefetchQuery(
        ['courses', courseID, 'discussions', item.content_id.toString()],
        async () => getData<Discussion>(`courses/${courseID}/discussion_topics/${item.content_id}`)
      )
    case 'File':
      return queryClient.prefetchQuery(
        ['courses', courseID, 'file', item.content_id.toString()],
        async () => await getData<File>(`courses/${courseID}/files/${item.content_id}`)
      )
    case 'Page':
      return queryClient.prefetchQuery(['courses', courseID, 'pages', item.page_url], async () =>
        getData<Page>(`courses/${courseID}/pages/${item.content_id}`)
      )
  }
}

export function ItemWrapper(props: {
  children: JSX.Element
  data: Item
  router: NextRouter
}): JSX.Element {
  const { children, data, router } = props

  switch (data.type) {
    case 'Assignment':
      return (
        <Link
          href={
            ['/courses', router.query.course, 'assignments', data.content_id].join('/') +
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
            ['/courses', router.query.course, 'discussion_topics', data.content_id].join('/') +
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
            ['/courses', router.query.course, 'files', data.content_id].join('/') +
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
            ['/courses', router.query.course, 'pages', data.page_url].join('/') +
            `?moduleItem=${data.id}`
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
