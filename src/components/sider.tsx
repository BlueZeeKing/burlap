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
      <div className="flex-grow bg">{props.children}</div>
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
  const [sidebarWidth, setSidebarWidth] = useState(200);

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
        setSidebarWidth(e.clientX);
      }
    };

    window.addEventListener("mousemove", mouseMoveHandler);

    return () => window.removeEventListener("mousemove", mouseMoveHandler);
  }, [isMouseDown]);

  return (
    <aside className="bg-zinc-100 dark:bg-zinc-700 relative select-none" style={{width: sidebarWidth}}>
      {data
        ?.sort((item) => item.position)
        .map((item) => (
          <p
            key={item.id}
            className={`pl-4 py-2 m-2 hover:bg-sky-400 hover:bg-opacity-[0.15] rounded-lg ${
              router.asPath == getURL(item, router.query.course as string)
                ? "bg-sky-400 !bg-opacity-30"
                : ""
            }`}
          >
            <Link href={getURL(item, router.query.course as string)}>
              {item.label}
            </Link>
          </p>
        ))}
        <div className="h-full absolute right-0 w-3 cursor-col-resize bg-blue-500 top-0 translate-x-[50%]" onMouseDown={() => setMouseDown(true)}></div>
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