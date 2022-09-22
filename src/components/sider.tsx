import { Button, useDisclosure } from "@chakra-ui/react";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { NextRouter, useRouter } from "next/router";
import { ReactNode, useEffect, useState } from "react";
import { getData } from "../lib/fetch";
import { queryClient } from "../pages/_app";
import { Tab, Module, Assignment, Announcement, Discussion } from "../types/api";
import PrefetchWrapper from "./prefetcher";

export default function SidebarWrapper(props: {children: ReactNode}) {
  return (
    <div className="flex flex-grow">
      <Sidebar />
      <div className="flex-grow bg basis-0">{props.children}</div>
    </div>
  )
}

function Sidebar() {
  const router = useRouter();

  const { data, isSuccess } = useQuery(
    ["courses", router.query.course, "tabs"],
    async () => await getData<Tab[]>(`courses/${router.query.course}/tabs`)
  );

  const [isMouseDown, setMouseDown] = useState(false)
  const {isOpen, onOpen, onClose} = useDisclosure()
  const [sidebarWidth, setSidebarWidth] = useState(200);
  const previewView = useDisclosure()

  useEffect(() => {
    const mouseUpHandler = () => {
      setMouseDown(false)
    }

    window.addEventListener("mouseup", mouseUpHandler)

    return () => window.removeEventListener("mouseup", mouseUpHandler)
  }, [])

  useEffect(() => {
    const mouseMoveHandler = (e) => {
      pauseEvent(e);
      if (isMouseDown) {
        if (e.clientX < 80) {
          onClose()
        } else {
          setSidebarWidth(e.clientX)
          window.localStorage.setItem("sidebar-width", e.clientX.toString());
        }
      }
    };

    window.addEventListener("mousemove", mouseMoveHandler);

    return () => window.removeEventListener("mousemove", mouseMoveHandler);
  }, [isMouseDown, onClose]);

  useEffect(() => {
    if (window.localStorage.getItem("sidebar-width") != null) {
      let data = parseInt(window.localStorage.getItem("sidebar-width"));
      setSidebarWidth(data);
    }

    if (window.localStorage.getItem("sidebar-open") != null && window.localStorage.getItem("sidebar-open") == "true") {
      onOpen();
    }
  }, [onOpen]);

  useEffect(() => {
    window.localStorage.setItem("sidebar-open", isOpen.toString());
  }, [isOpen]);

  return (
    <>
      {isOpen ? (
        <SiderInterior
          data={data}
          sidebarWidth={sidebarWidth}
          router={router}
          isMouseDown={isMouseDown}
          setMouseDown={setMouseDown}
          isResizable={true}
        />
      ) : (
        <>
          <div
            className="h-[600px] fixed w-14 top-[50%] left-0 -translate-y-[50%] z-50"
            onMouseEnter={previewView.onOpen}
          ></div>
          <div className="fixed bottom-0 left-0 p-3 z-50">
            <Button
              onClick={() => {
                setSidebarWidth(200);
                onOpen();
              }}
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </Button>
          </div>
          {previewView.isOpen ? (
            <div className="fixed top-[50%] left-0 -translate-y-[50%] h-[600px] z-50">
              <SiderInterior
                data={data}
                sidebarWidth={250}
                router={router}
                isMouseDown={isMouseDown}
                setMouseDown={setMouseDown}
                isResizable={false}
                onExit={previewView.onClose}
                className="overflow-y-scroll h-[600px] rounded-r shadow"
              />
            </div>
          ) : (
            ""
          )}
        </>
      )}
    </>
  );
}

function SiderInterior(props: { sidebarWidth: number; router: NextRouter; isMouseDown: boolean; setMouseDown: (a: boolean) => void; data: Tab[]; isResizable: boolean; className?: string; onExit?: () => void }) {
  const {sidebarWidth, router, isMouseDown, setMouseDown, data, isResizable, className, onExit} = props

  return (
    <aside
      className={"bg-zinc-100 dark:bg-zinc-700 relative select-none overflow-x-hidden " + (className ? className : "")}
      style={{ width: sidebarWidth, flexBasis: sidebarWidth }}
      onMouseLeave={onExit}
    >
      {data
        ?.sort((item) => item.position)
        .map((item) => (
          <PrefetchWrapper prefetch={() => getPrefetch(router, item)} key={item.id}>
            <Link href={getURL(item, router.query.course as string)}>
              <p
                className={`pl-4 py-2 m-2 hover:bg-sky-400 hover:bg-opacity-[0.15] cursor-pointer rounded-lg whitespace-nowrap overflow-x-hidden ${
                  router.asPath == getURL(item, router.query.course as string)
                    ? "bg-sky-400 !bg-opacity-30"
                    : ""
                }`}
              >
                {item.label}
              </p>
            </Link>
          </PrefetchWrapper>
        ))}
      { isResizable ? (
      <div
        className="h-full absolute right-0 w-4 cursor-col-resize top-0 translate-x-[50%] px-[0.37rem]"
        onMouseDown={() => setMouseDown(true)}
      >
        <div
          className={`${
            isMouseDown ? "bg-opacity-100" : "bg-opacity-0"
          } bg-sky-500 w-full h-full transition duration-200`}
        ></div>
      </div> ) : "" }
    </aside>
  );
}

function getURL(data: Tab, courseId: string) {
  if (data.type == "internal") {
    switch (data.id) {
      default: return data.html_url
    }
  } else {
    return "/404"
  }
}

function pauseEvent(e) {
  if (e.stopPropagation) e.stopPropagation();
  if (e.preventDefault) e.preventDefault();
  e.cancelBubble = true;
  e.returnValue = false;
  return false;
}

const getPrefetch = (router: NextRouter, tab: Tab) => {
  switch (tab.id) {
    case "modules":
      queryClient.prefetchQuery(["courses", router.query.course, "modules"], async () => getData<Module[]>(`courses/${router.query.course}/modules?include=items`)); break;
    case "announcements":
      queryClient.prefetchQuery(["courses", router.query.course, "announcements"], async () => getData<Announcement[]>(`courses/${router.query.course}/discussion_topics?only_announcements=true`)); break;
    case "assignments":
      queryClient.prefetchQuery(["courses", router.query.course, "assignments"], async () => getData<Assignment[]>(`courses/${router.query.course}/assignments`)); break;
    case "discussion_topics":
      queryClient.prefetchQuery(["courses", router.query.course, "discussions"], async () => getData<Discussion[]>(`courses/${router.query.course}/discussion_topics`)); break;
  }
};