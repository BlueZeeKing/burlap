import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import Header from "../../../components/header";
import { CourseLayout } from "../../../components/layout";
import Loader from "../../../components/loader";
import Sanitizer from "../../../components/sanitize";
import { getData } from "../../../lib/fetch";

interface Course {
  id: number;
  syllabus_body: string;
}

export default function Page() {
  const router = useRouter();

  const { isSuccess, data } = useQuery(
    ["courses", router.query.course],
    async () => getData<Course>(`courses/${router.query.course}?include=syllabus_body`)
  );

  return (
    <CourseLayout isSuccess={isSuccess}><PageView data={data} /></CourseLayout>
  );
}

function PageView(props: { data: Course }) {
  const { data } = props;

  return (
    <Sanitizer html={data.syllabus_body}  />
  );
}
