import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/router";
import { CourseLayout } from "../../../../components/layout";
import { useBreadcrumb } from "../../../../lib/breadcrumb";
import { getData } from "../../../../lib/fetch";
import { Assignment } from "../../../../types/api";

export default function AssignmentList() {
  const router = useRouter();

  const { isSuccess, data } = useQuery(
    ["courses", router.query.course, "assignments"],
    async () =>
      getData<Assignment[]>(
        `courses/${router.query.course}/assignments`
      )
  );

  useBreadcrumb([1, "Assignments", router.asPath]);

  return (
    <CourseLayout isSuccess={isSuccess}>
      <AssignmentView data={data} />
    </CourseLayout>
  );
}

function AssignmentView(props: { data: Assignment[] }) {
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
          {item.name}
        </Link>
      ))}
    </main>
  );
}
