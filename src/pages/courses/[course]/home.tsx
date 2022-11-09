import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import { CourseLayout } from '../../../components/layout'
import Sanitizer from '../../../components/sanitize'
import { useBreadcrumb } from '../../../lib/breadcrumb'
import { getData } from '../../../lib/fetch'
import { Page } from '../../../types'

export default function Home() {
  const router = useRouter()

  const { isSuccess, data } = useQuery(['courses', router.query.course, 'front_page'], async () =>
    getData<Page>(`courses/${router.query.course}/front_page`)
  )

  useBreadcrumb([1, 'Front Page', router.asPath])

  return (
    <CourseLayout isSuccess={isSuccess}>
      <PageView data={data} />
    </CourseLayout>
  )
}

function PageView(props: { data: Page }) {
  const { data } = props

  return <Sanitizer html={data.body} />
}
