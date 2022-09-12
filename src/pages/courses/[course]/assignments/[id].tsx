import { Avatar } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import Header from "../../../../components/header";
import { CourseLayout } from "../../../../components/layout";
import Loader from "../../../../components/loader";
import Sanitizer from "../../../../components/sanitize";
import { parseDate } from "../../../../lib/date";
import { getData } from "../../../../lib/fetch";
import { Assignment } from "../../../../types/api";

export default function AssignmentPage() {
  const router = useRouter();

  const { isSuccess, data } = useQuery(
    ["courses", router.query.course, "assignments", router.query.id],
    async () =>
      getData<Assignment>(`courses/${router.query.course}/assignments/${router.query.id}`)
  );

  return (
    <CourseLayout isSuccess={isSuccess}>
      <AssignmentView data={data} />
    </CourseLayout>
  );
}

function AssignmentView(props: { data: Assignment }) {
  const { data } = props

  console.log(data)

  return (
    <Sanitizer
      header={
        <div>
          <h2 className="!mb-3 !mt-6">{data.name}</h2>
          <p>{parseDate(data.due_at)}</p>
        </div>
      }
      html={data.description}
    />
  );
}