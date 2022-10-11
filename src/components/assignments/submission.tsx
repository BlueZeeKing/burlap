import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Button,
  Spinner,
  Textarea,
  Alert,
  AlertTitle,
  AlertIcon,
  AlertDescription,
} from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faClose,
  faPaperPlane,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";
import { Assignment, SubmissionType } from "../../types/api";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import DOMPurify from "isomorphic-dompurify";
import { submitAssignment, uploadFile } from "../../lib/fetch";
import { parse } from "path";
import { Converter } from "showdown";
import { open } from "@tauri-apps/api/dialog";
import { useRouter } from "next/router";

const converter = new Converter();

const submissionTypeKey = {
  online_upload: "File Upload",
  external_tool: "External Tool",
  online_text_entry: "Text Entry",
};

export default function Submitter(props: { data: Assignment; className?: string }) {
  const { data, className } = props;
  const router = useRouter()
  
  return (
    <aside className={"bg-zinc-800 rounded w-full " + (className ? className : "")}>
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
            <InternalTabPanel
              course={router.query.course as string}
              assignment={router.query.id as string}
              key={item}
              item={item}
            />
          ))}
        </TabPanels>
      </Tabs>
    </aside>
  );
}

function InternalTabPanel(props: {
  item: SubmissionType;
  course: string;
  assignment: string;
}) {
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

interface File {
  name: string;
  path: string;
}

function TextTab(props: { course: string; assignment: string }) {
  const [text, setText] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const submit = useMutation(async (text: string) => {
    return submitAssignment(props.course, props.assignment, {
      "submission[submission_type]": "online_text_entry",
      "submission[body]": DOMPurify.sanitize(converter.makeHtml(text)),
    });
  });

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

      const ids = await Promise.all(
        payload.map(async (item): Promise<number> => {
          const file = await readBinaryFile(item.path);
          const code = await uploadFile(
            `courses/${props.course}/assignments/${props.assignment}/submissions/self/files`,
            item.name,
            file
          );

          return code;
        })
      );

      const body = await submitAssignment(props.course, props.assignment, {
        "submission[submission_type]": "online_upload",
        "submission[file_ids][]": ids.join(","),
      });
    },
    { onSuccess: () => setFiles([]) }
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