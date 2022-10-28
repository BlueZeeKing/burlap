import { Spinner } from '@chakra-ui/react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter } from 'next/router'
import InfiniteScroll from 'react-infinite-scroll-component'
import { CourseLayout } from '../../../../components/layout'
import { useBreadcrumb } from '../../../../lib/breadcrumb'
import { getData, getInfiniteData } from '../../../../lib/fetch'
import { Assignment } from '../../../../types/api'

export default function AssignmentList() {
  const router = useRouter()

  const { data, fetchNextPage, hasNextPage, isSuccess } = useInfiniteQuery(
    ['courses', router.query.course, 'assignments'],
    async ({
      pageParam = `https://apsva.instructure.com/api/v1/courses/${router.query.course}/assignments`,
    }) => await getInfiniteData<Assignment[]>(pageParam),
    {
      getNextPageParam: (lastPage, pages) => lastPage.nextParams,
    }
  )

  useBreadcrumb([1, 'Assignments', router.asPath])

  return (
    <CourseLayout isSuccess={isSuccess}>
      <AssignmentView
        data={data?.pages?.flatMap(item => item.data)}
        fetchMore={fetchNextPage}
        hasMore={hasNextPage}
      />
    </CourseLayout>
  )
}

function AssignmentView(props: { data: Assignment[]; fetchMore: () => void; hasMore: boolean }) {
  const { data, fetchMore, hasMore } = props

  const router = useRouter()

  return (
    <main className="bg">
      <InfiniteScroll
        dataLength={data.length}
        next={fetchMore}
        hasMore={hasMore}
        loader={
          <div className="grid place-content-center">
            <Spinner colorScheme="blue" />
          </div>
        }
        className="p-6 flex flex-col space-y-6"
        endMessage={<p className="text-zinc-500 text-center">End of content</p>}
      >
        {data.map(item => (
          <Link
            href={['/courses', router.query.course, 'assignments', item.id].join('/')}
            key={item.id}
          >
            {item.name}
          </Link>
        ))}
      </InfiniteScroll>
    </main>
  )
}
