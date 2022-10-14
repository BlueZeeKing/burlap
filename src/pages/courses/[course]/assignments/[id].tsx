import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { CourseLayout } from "../../../../components/layout";
import Sanitizer from "../../../../components/sanitize";
import SequenceButtons from "../../../../components/sequencebuttons";
import { parseDate } from "../../../../lib/date";
import { getData } from "../../../../lib/fetch";
import { Assignment } from "../../../../types/api";

import { useRef, useState } from "react";

import { useBreadcrumb } from "../../../../lib/breadcrumb";
import Resizer from "../../../../components/resizer";
import Submitter from "../../../../components/assignments/submission";
import SubmissionDetail from "../../../../components/assignments/submissionDetails";

export default function AssignmentPage() {
  const router = useRouter();

  const { isSuccess, data } = useQuery(
    ["courses", router.query.course, "assignments", router.query.id],
    async () =>
      getData<Assignment>(`courses/${router.query.course}/assignments/${router.query.id}?include=submission`)
  );

  return (
    <CourseLayout isSuccess={isSuccess}>
      <AssignmentView data={data} />
    </CourseLayout>
  );
}

function AssignmentView(props: { data: Assignment }) {
  const { data } = props
  const router = useRouter()
  const [width, setWidth] = useState(700)
  const [height, setHeight] = useState(500);

  useBreadcrumb([2, data.name, router.asPath]);

  const ref = useRef<HTMLDivElement>()

  return (
    <div>
      <div
        className="grid grid-cols-2 m-4"
        style={{
          gridTemplateColumns: `${width}px 1px 1fr`,
          gridTemplateRows: `${height}px 1px 1fr`,
        }}
        ref={ref}
      >
        <Sanitizer
          header={
            <div>
              <h2 className="!mb-3 !mt-6">{data.name}</h2>
              <p>{parseDate(data.due_at)}</p>
            </div>
          }
          className="m-4 p-0 row-span-3 col-start-1 row-start-1"
          html={data.description}
        />
        <div className="relative row-span-3 col-start-2 row-start-1">
          <Resizer width={width} setWidth={setWidth} parentRef={ref} />
        </div>
        <Submitter data={data} className="col-start-3 row-start-1 m-4" />
        <div className="relative col-start-3 row-start-2">
          <Resizer horizontal width={height} setWidth={setHeight} parentRef={ref} />
        </div>
        <SubmissionDetail data={data.submission} className="col-start-3 row-start-3 m-4" />
      </div>
      <SequenceButtons />
    </div>
  );
}