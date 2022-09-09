import { Img } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/router";
import Header from "../components/header";
import Loader from "../components/loader";
import { getData } from "../lib/fetch";

interface Course {
  image: string;
  courseCode: string;
  shortName: string;
  id: number;
}

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
        <Link key={item.id} href={`/course/${item.id}/modules`}>
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