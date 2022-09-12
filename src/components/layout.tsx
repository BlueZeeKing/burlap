import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { ReactNode } from "react";
import { getData } from "../lib/fetch";
import { Course } from "../types/api";
import Header from "./header";
import Loader from "./loader";
import Sidebar from "./sider";

export function CourseLayout(props: {isSuccess: boolean; children: ReactNode}) {
  const router = useRouter()
  const { data } = useQuery(["courses", router.query.course], async () => await getData<Course>("courses/"+router.query.course));
  
  return (
    <div className="h-screen flex flex-col">
      <Header text={data?.name} />

      <Sidebar>{props.isSuccess ? props.children : <Loader />}</Sidebar>
    </div>
  );
}