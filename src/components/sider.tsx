import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode } from "react";
import { getData } from "../lib/fetch";

interface Tab {
  html_url: string;
  id: string;
  label: string;
  type: "external" | "internal";
  hidden: boolean;
  visibility: "public" | "members" | "admins" | "none";
  position: number;
}

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

  return (
    <aside className="bg-zinc-700 w-72">
      {data?.sort(item => item.position).map((item) => (
        <p key={item.id} className="pl-4 py-2"><Link href={item.html_url}>{item.label}</Link></p>
      ))}
    </aside>
  );
}

function getURL(data: Tab, courseId: number) {
  if (data.type == "internal") {
    switch (data.id) {
      case "home": return "/"
      default: return data.html_url
    }
  }
}