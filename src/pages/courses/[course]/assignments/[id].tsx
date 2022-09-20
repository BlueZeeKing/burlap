import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { CourseLayout } from "../../../../components/layout";
import Sanitizer from "../../../../components/sanitize";
import SequenceButtons from "../../../../components/sequencebuttons";
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

  return (
    <div>
      <Sanitizer
        header={
          <div>
            <h2 className="!mb-3 !mt-6">{data.name}</h2>
            <p>{parseDate(data.due_at)}</p>
          </div>
        }
        html={data.description}
      />
      <SequenceButtons />
    </div>
  );
}