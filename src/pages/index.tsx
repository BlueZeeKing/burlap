import Link from "next/link";
import Header from "../components/header";
import Loader from "../components/loader";

import { useQuery } from "@tanstack/react-query";

import { getData } from "../lib/fetch";

interface Course {
  image: string;
  courseCode: string;
  shortName: string;
  id: number;
  defaultView: DefaultView;
}

type DefaultView = "feed" | "wiki" | "modules" | "assignments" | "syllabus";

export default function App() {
  const {data, isSuccess} = useQuery(["dashboard"], async () => await getData<Course[]>("dashboard/dashboard_cards"))

  return (
    <div>
      <Header />

      {isSuccess ? <AppView data={data} /> : <Loader />}
    </div>
  );
}

function AppView(props: {data: Course[]}) {
  return (
    <main className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 auto-rows-max bg gap-6 p-6 w-screen">
      {props.data.map((item) => (
        <Link key={item.id} href={getURL(item)}>
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

function getURL(data: Course): string {

  switch (data.defaultView) {
    case "feed":
      return `/course/${data.id}/feed`
    case "wiki":
      return `/course/${data.id}/home`
    case "modules":
      return `/course/${data.id}/modules`
    case "assignments":
      return `/course/${data.id}/assignment`
    case "syllabus":
      return `/course/${data.id}/syllabus`
  }
}