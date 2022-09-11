import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/router";
import Header from "../../../../components/header";
import { CourseLayout } from "../../../../components/layout";
import Loader from "../../../../components/loader";
import { getData } from "../../../../lib/fetch";

interface Assignment {
  id: number;
  title: string;
  message: string;
  posted_at: string;
  delayed_post_at: string | null;
}

export default function Assignment() {
  const router = useRouter();

  const { isSuccess, data } = useQuery(
    ["courses", router.query.course, "assignments"],
    async () =>
      getData<Assignment[]>(
        `courses/${router.query.course}/assignments`
      )
  );

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
        >
          {item.title}
        </Link>
      ))}
    </main>
  );
}
