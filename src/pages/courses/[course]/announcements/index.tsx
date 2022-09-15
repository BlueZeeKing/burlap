import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/router";
import Header from "../../../../components/header";
import { CourseLayout } from "../../../../components/layout";
import Loader from "../../../../components/loader";
import { getData } from "../../../../lib/fetch";
import { Announcement } from "../../../../types/api";

export default function AnnouncementList() {
  const router = useRouter();

  const { isSuccess, data } = useQuery(
    ["courses", router.query.course, "announcements"],
    async () =>
      getData<Announcement[]>(
        `courses/${router.query.course}/discussion_topics?only_announcements=true`
      )
  );

  return (
    <CourseLayout isSuccess={isSuccess}>
      <AnnouncementView data={data} />
    </CourseLayout>
  );
}

function AnnouncementView(props: { data: Announcement[] }) {
  const { data } = props;

  const router = useRouter()

  return (
    <main className="bg p-6 flex flex-col space-y-6">
      {data.map((item) => (
        <Link href={["/courses", router.query.course, "announcements", item.id].join("/")} key={item.id}>{item.title}</Link>
      ))}
    </main>
  );
}
