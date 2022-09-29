import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { CourseLayout } from "../../../../components/layout";
import Sanitizer from "../../../../components/sanitize";
import SequenceButtons from "../../../../components/sequencebuttons";
import { parseDate } from "../../../../lib/date";
import { getData, submitAssignment, uploadFile } from "../../../../lib/fetch";
import { Assignment, SubmissionType } from "../../../../types/api";
import { Tabs, TabList, TabPanels, Tab, TabPanel, Button, Spinner, Textarea, Alert, AlertTitle, AlertIcon, AlertDescription } from "@chakra-ui/react";

import { open } from "@tauri-apps/api/dialog";
import { useState } from "react";
import { parse } from "path";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faClose, faPaperPlane, faUpload } from "@fortawesome/free-solid-svg-icons";
import { fetch } from "@tauri-apps/api/http";
import { getKey } from "../../../../lib/auth";
import { Converter } from "showdown";
import DOMPurify from "isomorphic-dompurify";

import { motion } from "framer-motion"
import { useBreadcrumb } from "../../../../lib/breadcrumb";

const converter = new Converter();

const submissionTypeKey = {"online_upload": "File Upload", "external_tool": "External Tool", "online_text_entry": "Text Entry"}

export default function AssignmentPage() {
  const router = useRouter();

  const { isSuccess, data } = useQuery(
    ["courses", router.query.course, "assignments", router.query.id],
    async () =>
      getData<Assignment>(`courses/${router.query.course}/assignments/${router.query.id}`)
  );

  return (
    <CourseLayout isSuccess={isSuccess}>
      <AssignmentView data={data} />
    </CourseLayout>
  );
}

function AssignmentView(props: { data: Assignment }) {
  const { data } = props
  const router = useRouter()

  useBreadcrumb([2, data.name, router.asPath]);

  return (
    <div>
      <div className="grid grid-cols-3">
        <Sanitizer
          header={
            <div>
              <h2 className="!mb-3 !mt-6">{data.name}</h2>
              <p>{parseDate(data.due_at)}</p>
            </div>
          }
          className="col-span-2"
          html={data.description}
        />
        <div className="flex flex-col flex-grow m-6 ml-0">
          <aside className="bg-zinc-800 rounded w-full">
            <h3 className="text-xl p-6">Submission</h3>
            <hr className="mx-4" />
            <Tabs p="6">
              <TabList>
                {data.submission_types.map((item) => (
                  <Tab key={item}>{submissionTypeKey[item]}</Tab>
                ))}
              </TabList>

              <TabPanels>
                {data.submission_types.map((item) => (
                  <InternalTabPanel course={router.query.course as string} assignment={router.query.id as string} key={item} item={item} />
                ))}
              </TabPanels>
            </Tabs>
          </aside>
          <div className="flex-grow"></div>
        </div>
      </div>
      <SequenceButtons />
    </div>
  );
}

function InternalTabPanel(props: {item: SubmissionType; course: string; assignment: string}) {
  switch (props.item) {
    case "online_upload":
      return <UploadTab course={props.course} assignment={props.assignment} />;
    case "online_text_entry":
      return <TextTab course={props.course} assignment={props.assignment} />;
    case "external_tool":
      return (
        <TabPanel className="grid place-content-center">
          <a href="">
            <Button colorScheme="blue">Open in Browser</Button>
          </a>
        </TabPanel>
      );
    default:
      return (
        <TabPanel className="grid place-content-center">
          <p>Unsupported submission type</p>
        </TabPanel>
      );
  }
}

interface File {name: string, path: string}

function TextTab(props: { course: string; assignment: string }) {
  const [text, setText] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const submit = useMutation(async (text: string) => {
    return submitAssignment(props.course, props.assignment, {
      "submission[submission_type]": "online_text_entry",
      "submission[body]": DOMPurify.sanitize(converter.makeHtml(text)),
    });
  })

  return (
    <TabPanel>
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
          submit.isLoading ? (
            <Spinner />
          ) : (
            <FontAwesomeIcon icon={submit.isSuccess ? faCheck : faPaperPlane} />
          )
        }
        onClick={() => submit.mutate(text)}
        my="4"
      >
        Submit
      </Button>
    </TabPanel>
  );
}

function UploadTab(props: { course: string; assignment: string }) {
  const [files, setFiles] = useState<File[]>([]);

  const addFile = (file: File) => {
    setFiles([file, ...files]);
  };

  const submit = useMutation(
    async (payload: File[]) => {
      const { readBinaryFile } = await import("@tauri-apps/api/fs");

      const ids = await Promise.all(payload.map(async (item): Promise<number> => {
        const file = await readBinaryFile(item.path);
        const code = await uploadFile(
          `courses/${props.course}/assignments/${props.assignment}/submissions/self/files`,
          item.name,
          file
        );

        return code
      }))

      const body = await submitAssignment(props.course, props.assignment, {
        "submission[submission_type]": "online_upload",
        "submission[file_ids][]": ids.join(","),
      });
    },
    { onSuccess: () => setFiles([])}
  );

  return (
    <TabPanel>
      <Alert status="error" variant="left-accent">
        <AlertIcon />
        Only one will be submitted
      </Alert>
      <ul className="list-disc w-full pb-4">
        {files.map((item, index) => (
          <li key={index}>
            <div className="flex">
              <span className="flex-grow pr-4">{item.name}</span>
              <div className="grid place-content-center">
                <FontAwesomeIcon
                  className="text-red-400 cursor-pointer"
                  icon={faClose}
                  onClick={() => {
                    setFiles([
                      ...files.slice(0, index),
                      ...files.slice(index + 1),
                    ]);
                  }}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex space-x-4 place-content-center">
        <Button
          onClick={async () => {
            const path = await open();
            if (path == null) return;
            let name = parse(path as string).base;
            addFile({ name: name, path: path as string });
          }}
          colorScheme="blue"
          leftIcon={<FontAwesomeIcon icon={faUpload} />}
          variant="outline"
        >
          Upload
        </Button>
        <Button
          colorScheme="blue"
          leftIcon={
            submit.isLoading ? (
              <Spinner />
            ) : (
              <FontAwesomeIcon
                icon={submit.isSuccess ? faCheck : faPaperPlane}
              />
            )
          }
          onClick={() => submit.mutate(files)}
          disabled={files.length == 0}
        >
          Submit
        </Button>
      </div>
    </TabPanel>
  );
}