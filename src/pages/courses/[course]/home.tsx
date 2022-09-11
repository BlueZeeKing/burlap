import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import Header from "../../../components/header";
import { CourseLayout } from "../../../components/layout";
import Loader from "../../../components/loader";
import Sanitizer from "../../../components/sanitize";
import Sidebar from "../../../components/sider";
import { getData } from "../../../lib/fetch";
import { Page } from "../../../types/api";

export default function Home() {
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
