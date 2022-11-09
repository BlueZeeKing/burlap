import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import { CourseLayout } from '../../../../components/layout'
import Sanitizer from '../../../../components/sanitize'
import { useBreadcrumb } from '../../../../lib/breadcrumb'
import { parseDate } from '../../../../lib/date'
import { getData } from '../../../../lib/fetch'
import { Announcement } from '../../../../types'

export default function AnnouncementPage() {
  const router = useRouter()

  const { isSuccess, data } = useQuery(
    ['courses', router.query.course, 'announcements', router.query.id],
    async () =>
      getData<Announcement>(`courses/${router.query.course}/discussion_topics/${router.query.id}`)
  )

  return (
    <CourseLayout isSuccess={isSuccess}>
      <AnnouncementView data={data} />
    </CourseLayout>
  )
}

function AnnouncementView(props: { data: Announcement }) {
  const { data } = props
  const router = useRouter()

  useBreadcrumb([2, data.title, router.asPath])

  return (
    <Sanitizer
      html={data.message}
      header={
        <div>
          <h2 className="!mb-3 !mt-6">{data.title}</h2>
          <p>{parseDate(data.delayed_post_at != null ? data.delayed_post_at : data.posted_at)}</p>
        </div>
      }
    />
  )
}
