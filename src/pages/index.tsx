import { Img } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { getData } from "../../lib/fetch";

interface Course {
  image: string;
  longName: string;
  shortName: string;
  id: number;
}

export default function App() {
  const {data, isSuccess} = useQuery(["dashboard"], async () => await getData<Course[]>("dashboard/dashboard_cards"))

  return (
    <div>
      <main>
        {isSuccess ? data.map((item) => (
          <div key={item.id}>{item.shortName}</div>
        )) : ""}
      </main>
    </div>
  )
}