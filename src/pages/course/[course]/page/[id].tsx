import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import Header from "../../../../components/header";
import Loader from "../../../../components/loader";
import Sanitizer from "../../../../components/sanitize";
import { getData } from "../../../../lib/fetch";

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
    ["course", router.query.course, "page", router.query.id],
    async () =>
      getData<Page>(`courses/${router.query.course}/pages/${router.query.id}`)
  );

  return (
    <div>
      <Header />

      {isSuccess ? <PageView data={data} /> : <Loader />}
    </div>
  );
}

function PageView(props: { data: Page }) {
  const { data } = props

  return (
    <Sanitizer html={data.body} />
  );
}