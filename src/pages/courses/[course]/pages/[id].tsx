import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { CourseLayout } from "../../../../components/layout";
import Sanitizer from "../../../../components/sanitize";
import SequenceButtons from "../../../../components/sequencebuttons";
import { useBreadcrumb } from "../../../../lib/breadcrumb";
import { getData } from "../../../../lib/fetch";
import { Page } from "../../../../types/api";

export default function PageApp() {
  const router = useRouter();

  const { isSuccess, data } = useQuery(
    ["courses", router.query.course, "pages", router.query.id],
    async () =>
      getData<Page>(`courses/${router.query.course}/pages/${router.query.id}`)
  );

  return (
    <CourseLayout isSuccess={isSuccess}>
      <PageView data={data} />
    </CourseLayout>
  );
}

function PageView(props: { data: Page }) {
  const { data } = props
  const router = useRouter();

  useBreadcrumb([2, data.title, router.asPath]);

  return (
    <div>
      <Sanitizer
        html={data.body}
        header={
          <div>
            <h2 className="!mb-3 !mt-6">{data.title}</h2>
          </div>
        }
      />
      <SequenceButtons />
    </div>
  );
}