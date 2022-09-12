import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import Header from "../../../../components/header";
import { CourseLayout } from "../../../../components/layout";
import Loader from "../../../../components/loader";
import Sanitizer from "../../../../components/sanitize";
import { getData } from "../../../../lib/fetch";
import { Announcement } from "../../../../types/api";

export default function AnnouncementPage() {
  const router = useRouter();

  const { isSuccess, data } = useQuery(
    ["courses", router.query.course, "announcements", router.query.id],
    async () =>
      getData<Announcement>(
        `courses/${router.query.course}/discussion_topics/${router.query.id}`
      )
  );

  return (
    <CourseLayout isSuccess={isSuccess}>
      <AnnouncementView data={data} />
    </CourseLayout>
  );
}

function AnnouncementView(props: { data: Announcement }) {
  const { data } = props;

  return (
    <Sanitizer html={data.message} />
  );
}
