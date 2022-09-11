import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import Header from "../../../components/header";
import { CourseLayout } from "../../../components/layout";
import Loader from "../../../components/loader";
import Sanitizer from "../../../components/sanitize";
import Sidebar from "../../../components/sider";
import { getData } from "../../../lib/fetch";

interface Page {
  page_id: number;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
}

export default function Page() {
  const router = useRouter();

  const { isSuccess, data } = useQuery(
    ["courses", router.query.course, "front_page"],
    async () => getData<Page>(`courses/${router.query.course}/front_page`)
  );

  return (
    <CourseLayout isSuccess={isSuccess}>
      <PageView data={data} />
    </CourseLayout>
  );
}

function PageView(props: { data: Page }) {
  const { data } = props;

  return (
    <Sanitizer html={data.body} />
  );
}
