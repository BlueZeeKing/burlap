import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { getData } from "../../../lib/fetch";
import { Course } from "../../../types/api";
import AssignmentList from "./assignments";
import Wiki from "./home";
import Syllabus from "./syllabus";
import Modules from "./modules";
import { CourseLayout } from "../../../components/layout";

export default function Home() {
  const router = useRouter()
  const {data, isSuccess} = useQuery(["courses", router.query.course], async () => await getData<Course>("courses/"+router.query.course))

  if (isSuccess) {
    switch (data.default_view) {
      case "assignments": return <AssignmentList />;
      case "wiki": return <Wiki />;
      case "syllabus": return <Syllabus />;
      default: <Modules />
    }
  } else {
    return <CourseLayout isSuccess={false}>Error</CourseLayout>
  }
}