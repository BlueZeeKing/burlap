import { Avatar } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { NextRouter, useRouter } from "next/router";
import { useEffect, useRef } from "react";
import Header from "../../../../components/header";
import { CourseLayout } from "../../../../components/layout";
import Loader from "../../../../components/loader";
import Sanitizer, { clean } from "../../../../components/sanitize";
import SequenceButtons from "../../../../components/sequencebuttons";
import { parseDate } from "../../../../lib/date";
import { getData } from "../../../../lib/fetch";
import { Assignment, Discussion } from "../../../../types/api";

interface DiscussionView {
  unread_entries: number[];
  entry_ratings: { [key: number]: number };
  participants: User[];
  view: DiscussionEntry[];
}

interface User {
  id: number;
  display_name: string;
  avatar_image_url: string;
}

interface DiscussionEntry {
  id: number;
  user_id: number;
  message: string;
  created_at: string;
}

export default function AssignmentPage() {
  const router = useRouter();

  const { isSuccess, data } = useQuery(
    ["courses", router.query.course, "discussions", router.query.id],
    async () =>
      getData<Discussion>(
        `courses/${router.query.course}/discussion_topics/${router.query.id}`
      )
  );

  const discussionView = useQuery(
    ["courses", router.query.course, "discussions", router.query.id, "view"],
    async () =>
      getData<DiscussionView>(
        `courses/${router.query.course}/discussion_topics/${router.query.id}/view`
      )
  );

  return (
    <CourseLayout isSuccess={isSuccess}>
      <AssignmentView data={data} viewData={discussionView.data} viewDataReady={discussionView.isSuccess} />
    </CourseLayout>
  );
}

function AssignmentView(props: { data: Discussion; viewData: DiscussionView; viewDataReady: boolean }) {
  const { data, viewData, viewDataReady } = props;

  const router = useRouter()

  return (
    <div>
      <Sanitizer
        header={
          <div>
            <h2 className="!mb-3 !mt-6">{data.title}</h2>
            <p>{parseDate(data.posted_at)}</p>
          </div>
        }
        html={data.message}
      />
      {viewDataReady ? viewData.view.map((item) => <DiscussionEntryView entry={item} author={viewData.participants.find((user) => user.id == item.user_id)} router={router} key={item.id} />) : ""}
      <SequenceButtons />
    </div>
  );
}

function DiscussionEntryView(props: {entry: DiscussionEntry; author: User, router: NextRouter }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    clean(props.entry.message, ref, props.router);
  }, [props.entry.message, props.router]);
  
  return (
    <div className="bg-zinc-200 dark:bg-zinc-800 p-4 m-4 rounded border-zinc-300 dark:border-zinc-700 border">
      <div className="flex">
        <Avatar
          src={props.author.avatar_image_url}
          name={props.author.display_name}
          size="md"
        />
        <p className="grid content-center p-2">{props.author.display_name}</p>
      </div>
      <div className="prose dark:prose-invert " ref={ref} />
    </div>
  );
}