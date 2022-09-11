import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import Header from "../../../../components/header";
import Loader from "../../../../components/loader";
import Sanitizer from "../../../../components/sanitize";
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
    ["course", router.query.course, "announcement", router.query.id],
    async () =>
      getData<Announcement>(
        `courses/${router.query.course}/discussion_topics/${router.query.id}`
      )
  );

  return (
    <div>
      <Header />

      {isSuccess ? <AnnouncementView data={data} /> : <Loader />}
    </div>
  );
}

function AnnouncementView(props: { data: Announcement }) {
  const { data } = props;

  return (
    <Sanitizer html={data.message} />
  );
}
