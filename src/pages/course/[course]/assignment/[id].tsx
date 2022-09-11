import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import Header from "../../../../components/header";
import Loader from "../../../../components/loader";
import Sanitizer from "../../../../components/sanitize";
import { getData } from "../../../../lib/fetch";

interface Assignment {
  id: number;
  name: string;
  description: string;
  created_at: string;
  due_at: string;
  submission_types: SubmissionType[];
  has_submitted_submissions: boolean;

}

type SubmissionType = 'discussion_topic' | 'online_quiz' | 'on_paper' | 'none' | 'external_tool' | 'online_text_entry' | 'online_url' | 'online_upload' | 'media_recording' | 'student_annotation'

export default function Assignment() {
  const router = useRouter();

  const { isSuccess, data } = useQuery(
    ["course", router.query.course, "assignment", router.query.id],
    async () =>
      getData<Assignment>(`courses/${router.query.course}/assignments/${router.query.id}`)
  );

  return (
    <div>
      <Header />

      {isSuccess ? <AssignmentView data={data} /> : <Loader />}
    </div>
  );
}

function AssignmentView(props: { data: Assignment }) {
  const { data } = props

  return (
    <Sanitizer html={data.description} />
  );
}