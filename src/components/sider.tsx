import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode, useEffect } from "react";
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
        getData<Assignment[]>(
          `courses/${router.query.course}/assignments`
        )
    );

    queryClient.prefetchQuery(
      ["courses", router.query.course, "announcements"],
      async () =>
        getData<Announcement[]>(
          `courses/${router.query.course}/discussion_topics?only_announcements=true`
        )
    );
  }, [])

  return (
    <aside className="bg-zinc-100 dark:bg-zinc-700 w-72 basis-72">
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