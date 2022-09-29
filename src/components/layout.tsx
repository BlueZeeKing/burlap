import { BreadcrumbItem, Breadcrumb, BreadcrumbSeparator, BreadcrumbLink } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode } from "react";
import { useBreadcrumb } from "../lib/breadcrumb";
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

      <Sidebar>
        <>
          <BreadcrumbElement />
          {props.isSuccess ? props.children : <Loader />}
        </>
      </Sidebar>
    </div>
  );
}

function BreadcrumbElement() {
  const breadcrumb = useBreadcrumb()

  return (
    <Breadcrumb pl="6" pt="6" className="text-zinc-400">
      {breadcrumb.map((item, index) => (
        <BreadcrumbItem key={index}>
          <Link href={item.url}><span className="cursor-pointer hover:text-sky-400 transition !text-zinc-200">{item.name}</span></Link>
        </BreadcrumbItem>
      ))}
    </Breadcrumb>
  );
}