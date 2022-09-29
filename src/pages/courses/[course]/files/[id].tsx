import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { CourseLayout } from "../../../../components/layout";

import { pdfjs, Document, Page } from "react-pdf";
import { getData } from "../../../../lib/fetch";
import { File } from "../../../../types/api"
import { parseDate } from "../../../../lib/date";
import { Button } from "@chakra-ui/react";
import { save } from "@tauri-apps/api/dialog";
import { writeBinaryFile } from "@tauri-apps/api/fs";
import { useState } from "react";
import SequenceButtons from "../../../../components/sequencebuttons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { useBreadcrumb } from "../../../../lib/breadcrumb";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.js`;

export default function FilePage() {
  const router = useRouter()
  const { isSuccess, data } = useQuery(["courses", router.query.course, "file", router.query.id], async () => await getData<File>(`courses/${router.query.course}/files/${router.query.id}`))

  return (
    <CourseLayout isSuccess={isSuccess}><FileView data={data} /></CourseLayout>
  )
}

function FileView(props: {data: File}) {
  const router = useRouter()
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  useBreadcrumb([2, props.data.display_name, router.asPath]);

  function removeTextLayerOffset() {
    const textLayers = document.querySelectorAll(
      ".react-pdf__Page__textContent"
    );
    textLayers.forEach((layer) => {
      const { style } = layer as HTMLElement;
      style.top = "0";
      style.left = "0";
      style.transform = "";
    });
  }

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  function decrement() {
    if (currentPage > 1) {
      setCurrentPage(currentPage-1)
    }
  }

  function increment() {
    if (currentPage < numPages) {
      setCurrentPage(currentPage+1)
    }
  }
  
  return (
    <main>
      <header className="flex">
        <div>
          <h2 className="p-8 pb-4 text-3xl font-bold">
            {props.data.display_name}
          </h2>
          <p className="pl-8 p-4 pt-0 text-zinc-400">
            {parseDate(props.data.created_at)}
          </p>
        </div>
        <div className="flex-grow" />
        <div className="grid place-content-center p-8">
          <Button
            colorScheme="blue"
            px="6"
            onClick={async () => {
              const path = await save({ defaultPath: props.data.filename });
              if (path == null) return;
              const file = await (await fetch(props.data.url)).arrayBuffer();
              await writeBinaryFile({
                path: path,
                contents: file,
              });
            }}
          >
            Save
          </Button>
        </div>
      </header>
      <hr className="mx-16" />
      <div className="flex">
        {numPages > 3 ? (
          <div className="place-content-center grid p-8">
            <Button>
              <FontAwesomeIcon
                icon={faChevronLeft}
                onClick={() => decrement()}
              />
            </Button>
          </div>
        ) : (
          ""
        )}
        <Document file={props.data.url} onLoadSuccess={onDocumentLoadSuccess}>
          {numPages < 3 ? (
            Array.apply(null, { length: numPages })
              .map(Number.call, Number)
              .map((item, index) =>
                item == null ? (
                  ""
                ) : (
                  <Page
                    onLoadSuccess={removeTextLayerOffset}
                    pageNumber={index + 1}
                    className="m-8"
                  />
                )
              )
          ) : (
            <Page
              onLoadSuccess={removeTextLayerOffset}
              pageNumber={currentPage}
              className="m-8"
            />
          )}
        </Document>
        {numPages > 3 ? (
          <div className="place-content-center grid p-8">
            <Button>
              <FontAwesomeIcon
                icon={faChevronRight}
                onClick={() => increment()}
              />
            </Button>
          </div>
        ) : (
          ""
        )}
      </div>
      <SequenceButtons />
    </main>
  );
}