import { Button, useDisclosure } from "@chakra-ui/react";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useState } from "react";
import { getData } from "../lib/fetch";
import { queryClient } from "../pages/_app";
import { Tab, Module, Assignment, Announcement } from "../types/api";

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
  const {isOpen, onOpen, onClose} = useDisclosure({defaultIsOpen: typeof window !== 'undefined' && window.localStorage.getItem("sidebar-open") != null ? window.localStorage.getItem("sidebar-open") == "true" : true})
  const [sidebarWidth, setSidebarWidth] = useState(typeof window !== 'undefined' && window.localStorage.getItem("sidebar-width") != null ? parseInt(window.localStorage.getItem("sidebar-width")) : 200);

  useEffect(() => {
    window.localStorage.setItem("sidebar-width", sidebarWidth.toString())
    window.localStorage.setItem("sidebar-width", isOpen.toString());
  }, [sidebarWidth, isOpen])

  useEffect(() => {
    queryClient.prefetchQuery(
      ["courses", router.query.course, "modules"],
      async () =>
        getData<Module[]>(
          `courses/${router.query.course}/modules?include=items`
        )
    );

    queryClient.prefetchQuery(
      ["courses", router.query.course, "assignments"],
      async () =>
        getData<Assignment[]>(`courses/${router.query.course}/assignments`)
    );

    queryClient.prefetchQuery(
      ["courses", router.query.course, "announcements"],
      async () =>
        getData<Announcement[]>(
          `courses/${router.query.course}/discussion_topics?only_announcements=true`
        )
    );
  }, [router.query.course]);

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
          setSidebarWidth(e.clientX);
        }
      }
    };

    window.addEventListener("mousemove", mouseMoveHandler);

    return () => window.removeEventListener("mousemove", mouseMoveHandler);
  }, [isMouseDown]);

  console.log(isOpen)

  return (
    <>
      {isOpen ? (
        <aside
          className="bg-zinc-100 dark:bg-zinc-700 relative select-none"
          style={{ width: sidebarWidth, flexBasis: sidebarWidth }}
        >
          {data
            ?.sort((item) => item.position)
            .map((item) => (
              <Link href={getURL(item, router.query.course as string)}>
                <p
                  key={item.id}
                  className={`pl-4 py-2 m-2 hover:bg-sky-400 hover:bg-opacity-[0.15] cursor-pointer rounded-lg ${
                    router.asPath == getURL(item, router.query.course as string)
                      ? "bg-sky-400 !bg-opacity-30"
                      : ""
                  }`}
                >
                  {item.label}
                </p>
              </Link>
            ))}
          <div
            className="h-full absolute right-0 w-4 cursor-col-resize top-0 translate-x-[50%] px-[0.37rem]"
            onMouseDown={() => setMouseDown(true)}
          >
            <div
              className={`${
                isMouseDown ? "bg-opacity-100" : "bg-opacity-0"
              } bg-sky-500 w-full h-full transition duration-200`}
            ></div>
          </div>
        </aside>
      ) : (
        <div className="fixed bottom-0 left-0 p-3">
          <Button onClick={() => {
            setSidebarWidth(200)
            onOpen()
          }}>
            <FontAwesomeIcon icon={faChevronRight} />
          </Button>
        </div>
      )}
    </>
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