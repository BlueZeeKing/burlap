import { ReactNode } from "react";
import Header from "./header";
import Loader from "./loader";
import Sidebar from "./sider";

export function CourseLayout(props: {isSuccess: boolean; children: ReactNode}) {
  return (
    <div className="h-screen flex flex-col">
      <Header />

      <Sidebar>{props.isSuccess ? props.children : <Loader />}</Sidebar>
    </div>
  );
}