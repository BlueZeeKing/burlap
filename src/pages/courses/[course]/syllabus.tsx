import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import { CourseLayout } from '../../../components/layout'
import Sanitizer from '../../../components/sanitize'
import { useBreadcrumb } from '../../../lib/breadcrumb'
import { getData } from '../../../lib/fetch'
import { Course } from '../../../types/api'

export default function Syllabus() {
  const router = useRouter()

  const { isSuccess, data } = useQuery(['courses', router.query.course, 'syllabus'], async () =>
    getData<Course>(`courses/${router.query.course}?include=syllabus_body`)
  )

  useBreadcrumb([1, 'Syllabus', router.asPath])

  return (
    <CourseLayout isSuccess={isSuccess}>
      <PageView data={data} />
    </CourseLayout>
  )
}

function PageView(props: { data: Course }) {
  const { data } = props

  return <Sanitizer html={data.syllabus_body} />
}
