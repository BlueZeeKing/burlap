import { Avatar, Button, Spinner, Textarea } from "@chakra-ui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { NextRouter, useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { CourseLayout } from "../../../../components/layout";
import Sanitizer, { clean } from "../../../../components/sanitize";
import SequenceButtons from "../../../../components/sequencebuttons";
import { useBreadcrumb } from "../../../../lib/breadcrumb";
import { parseDate } from "../../../../lib/date";
import { getData, uploadDiscussionResponse } from "../../../../lib/fetch";
import { Discussion } from "../../../../types/api";
import { Converter } from "showdown";
import DOMPurify from "isomorphic-dompurify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { queryClient } from "../../../_app";

const converter = new Converter();

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
  deleted: boolean;
}

export default function DiscussionPage() {
  const router = useRouter();

  const { isSuccess, data } = useQuery(
    ["courses", router.query.course, "discussions", router.query.id],
    async () =>
      getData<Discussion>(
        `courses/${router.query.course}/discussion_topics/${router.query.id}`
      )
  );

  const discussionView = useQuery( // TODO: Infinite query
    ["courses", router.query.course, "discussions", router.query.id, "view"],
    async () =>
      getData<DiscussionView>(
        `courses/${router.query.course}/discussion_topics/${router.query.id}/view`
      )
  );

  return (
    <CourseLayout isSuccess={isSuccess}>
      <DiscussionView data={data} viewData={discussionView.data} viewDataReady={discussionView.isSuccess} />
    </CourseLayout>
  );
}

function DiscussionView(props: { data: Discussion; viewData: DiscussionView; viewDataReady: boolean }) {
  const { data, viewData, viewDataReady } = props;

  const router = useRouter()

  useBreadcrumb([2, data.title, router.asPath]);

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
      {data.locked ? "" : <DiscussionSubmissionView router={router} />}
      {viewDataReady ? viewData.view.filter((item) => !item.deleted).map((item) => <DiscussionEntryView entry={item} author={viewData.participants.find((user) => user.id == item.user_id)} router={router} key={item.id} />) : ""}
      <SequenceButtons />
    </div>
  );
}

function DiscussionSubmissionView(props: {
  router: NextRouter;
}) {

  const [text, setText] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const mutation = useMutation(async (text: string) => {
    uploadDiscussionResponse(
      props.router.query.course as string,
      props.router.query.id as string,
      text
    );
  }, {onSuccess: () => {
    queryClient.invalidateQueries(["courses", props.router.query.course, "discussions", props.router.query.id, "view"])
    setText("")
  }})

  return (
    <div className="bg-zinc-200 dark:bg-zinc-800 p-4 m-4 rounded border-zinc-300 dark:border-zinc-700 border">
      <div className="pb-4">
        <button
          onClick={() => setShowPreview(false)}
          className={`rounded-l-md w-20 py-1 border-zinc-600 border-r ${
            !showPreview ? "bg-sky-400" : "bg-zinc-700"
          }`}
        >
          Source
        </button>
        <button
          onClick={() => setShowPreview(true)}
          className={`rounded-r-md w-20 py-1 ${
            showPreview ? "bg-sky-400" : "bg-zinc-700"
          }`}
        >
          Preview
        </button>
      </div>
      {showPreview ? (
        <div
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(converter.makeHtml(text)),
          }}
        />
      ) : (
        <Textarea value={text} onChange={(e) => setText(e.target.value)} />
      )}
      <Button
        colorScheme="blue"
        leftIcon={
          mutation.isLoading ? (
            <Spinner />
          ) : (
            <FontAwesomeIcon
              icon={mutation.isSuccess ? faCheck : faPaperPlane}
            />
          )
        }
        onClick={() => mutation.mutate(text)}
        my="4"
      >
        Submit
      </Button>
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