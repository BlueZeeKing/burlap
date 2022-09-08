import { Img } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/router";
import Header from "../components/header";
import { getData } from "../lib/fetch";

interface Course {
  image: string;
  courseCode: string;
  shortName: string;
  id: number;
}

export default function App() {
  const {data, isSuccess} = useQuery(["dashboard"], async () => await getData<Course[]>("dashboard/dashboard_cards"))

  console.log(data)

  return (
    <div>
      <Header />
      
      <main className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 auto-rows-max bg-zinc-200 gap-6 p-6 w-screen">
        {isSuccess ? data.map((item) => (
          <Link  key={item.id} href="/test">
            <div className="p-6 bg-white rounded border-zinc-300 border cursor-pointer">
              <h2 className="text-xl">{item.shortName}</h2>
              <p className="text-sm text-zinc-500">{item.courseCode}</p>
            </div>
          </Link>
        )) : ""}
      </main>
    </div>
  )
}