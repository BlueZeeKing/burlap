import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/router";
import { CourseLayout } from "../../../../components/layout";
import { getData } from "../../../../lib/fetch";
import { Assignment, Discussion } from "../../../../types/api";

export default function AssignmentList() {
  const router = useRouter();

  const { isSuccess, data } = useQuery(
    ["courses", router.query.course, "discussions"],
    async () =>
      getData<Discussion[]>(`courses/${router.query.course}/discussion_topics`)
  );

  return (
    <CourseLayout isSuccess={isSuccess}>
      <AssignmentView data={data} />
    </CourseLayout>
  );
}

function AssignmentView(props: { data: Discussion[] }) {
  const { data } = props;

  const router = useRouter();

  return (
    <main className="bg p-6 flex flex-col space-y-6">
      {data.map((item) => (
        <Link
          href={["/courses", router.query.course, "assignments", item.id].join(
            "/"
          )}
          key={item.id}
        >
          {item.title}
        </Link>
      ))}
    </main>
  );
}
