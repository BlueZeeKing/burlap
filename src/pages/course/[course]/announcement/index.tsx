import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/router";
import Header from "../../../../components/header";
import Loader from "../../../../components/loader";
import { getData } from "../../../../lib/fetch";

interface Announcement {
  id: number;
  title: string;
  message: string;
  posted_at: string;
  delayed_post_at: string | null;
}

export default function Announcement() {
  const router = useRouter();

  const { isSuccess, data } = useQuery(
    ["course", router.query.course, "announcement"],
    async () =>
      getData<Announcement[]>(
        `courses/${router.query.course}/discussion_topics?only_announcements=true`
      )
  );

  return (
    <div>
      <Header />

      {isSuccess ? <AnnouncementView data={data} /> : <Loader />}
    </div>
  );
}

function AnnouncementView(props: { data: Announcement[] }) {
  const { data } = props;

  const router = useRouter()

  return (
    <main className="bg p-6 flex flex-col space-y-6">
      {data.map((item) => (
        <Link href={["/course", router.query.course, "announcement", item.id].join("/")}>{item.title}</Link>
      ))}
    </main>
  );
}
