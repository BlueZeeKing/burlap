import Link from "next/link";
import Header from "../components/header";
import Loader from "../components/loader";

import { useQuery } from "@tanstack/react-query";

import { getData } from "../lib/fetch";
import { queryClient } from "./_app";
import { Page, Course, Module, Assignment, Tab, DashboardCourse } from "../types/api";

export default function App() {
  const {data, isSuccess} = useQuery(["dashboard"], async () => await getData<DashboardCourse[]>("dashboard/dashboard_cards"), {onSuccess: (data) => {
    data.forEach((item) => {
      queryClient.setQueryData(["courses", item.id.toString()], {
        course_code: item.courseCode,
        name: item.shortName,
        id: item.id,
        default_view: item.defaultView,
      });

      queryClient.prefetchQuery(
        ["courses", item.id.toString(), "tabs"],
        async () =>
          getData<Tab[]>(`courses/${item.id}/tabs`)
      );

      switch (item.defaultView) {
        case "wiki":
          queryClient.prefetchQuery(
            ["courses", item.id.toString(), "front_page"],
            async () => getData<Page>(`courses/${item.id}/front_page`)
          );
          return;
        case "modules":
          queryClient.prefetchQuery(
            ["courses", item.id.toString(), "modules"],
            async () =>
              getData<Module[]>(`courses/${item.id}/modules?include=items`)
          );
          return;
        case "assignments":
          queryClient.prefetchQuery(
            ["courses", item.id.toString(), "assignments"],
            async () => getData<Assignment[]>(`courses/${item.id}/assignments`)
          );
          return;
        case "syllabus":
          queryClient.prefetchQuery(
            ["courses", item.id.toString(), "syllabus"],
            async () =>
              getData<Module[]>(`courses/${item.id}?include=syllabus_body`)
          );
          return;
      }
    })
  }})

  return (
    <div>
      <Header />

      {isSuccess ? <AppView data={data} /> : <Loader />}
    </div>
  );
}

function AppView(props: { data: DashboardCourse[] }) {
  return (
    <main className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 auto-rows-max bg gap-6 p-6 w-screen">
      {props.data.map((item) => (
        <Link key={item.id} href={`/courses/${item.id}`}>
          <div className="p-6 bg-white dark:bg-zinc-800 rounded border-zinc-300 dark:border-zinc-700 border cursor-pointer">
            <h2 className="text-xl">{item.shortName}</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {item.courseCode}
            </p>
          </div>
        </Link>
      ))}
    </main>
  );
}