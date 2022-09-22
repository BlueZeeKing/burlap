import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { CourseLayout } from "../../../../components/layout";
import Sanitizer from "../../../../components/sanitize";
import SequenceButtons from "../../../../components/sequencebuttons";
import { parseDate } from "../../../../lib/date";
import { deleteData, getData, uploadFile } from "../../../../lib/fetch";
import { Assignment, SubmissionType } from "../../../../types/api";
import { Tabs, TabList, TabPanels, Tab, TabPanel, Button, Spinner } from "@chakra-ui/react";

import { once } from "@tauri-apps/api/event";
import { open } from "@tauri-apps/api/dialog";
import { useEffect, useState } from "react";
import { parse } from "path";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faClose, faPaperPlane, faSpinner, faUpload } from "@fortawesome/free-solid-svg-icons";
import { fetch } from "@tauri-apps/api/http";
import { getKey } from "../../../../lib/auth";

const submissionTypeKey = {"online_upload": "File Upload", "external_tool": "External Tool"}

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
    case "external_tool":
      return (
        <TabPanel className="grid place-content-center">
          <a href="">
            <Button colorScheme="blue">
              Open in Browser
            </Button>
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

function UploadTab(props: { course: string; assignment: string }) {
  const [files, setFiles] = useState<File[]>([]);

  const addFile = (file: File) => {
    setFiles([file, ...files]);
  };

  /*useEffect(() => {
    let active = true;

    const handleEvent = async (event) => {
      if (active) {
        event.payload.forEach((item: string) => {
          let name = parse(item as string).base;
          addFile({name: name, path: item})
        })
        once("tauri://file-drop", handleEvent);
      }
    };

    once("tauri://file-drop", handleEvent);

    return () => {
      active = false;
    };
  }, []);*/

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

      const key = await getKey();
      const body = await fetch(
        `https://apsva.instructure.com/api/v1/courses/${props.course}/assignments/${props.assignment}/submissions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
          },
          query: {
            "submission[submission_type]": "online_upload",
            "submission[file_ids][]": ids.join(","),
          },
        }
      );

      if (body.ok) return
      throw body.status
    }
  );

  return (
    <TabPanel className="grid place-content-center">
      <Button
        onClick={async () => {
          const path = await open();
          if (path == null) return;
          let name = parse(path as string).base;
          addFile({ name: name, path: path as string });
        }}
        m="4"
        colorScheme="blue"
        leftIcon={<FontAwesomeIcon icon={faUpload} />}
        variant="outline"
      >
        Click to Upload
      </Button>
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
      <Button
        colorScheme="blue"
        leftIcon={submit.isLoading ? <Spinner /> : <FontAwesomeIcon icon={submit.isSuccess ? faCheck : faPaperPlane} />}
        onClick={() => submit.mutate(files)}
        disabled={files.length == 0}
      >
        Submit
      </Button>
    </TabPanel>
  );
}