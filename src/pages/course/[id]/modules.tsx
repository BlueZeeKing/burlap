import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import Header from "../../../components/header";
import Loader from "../../../components/loader";
import { getData } from "../../../lib/fetch";

interface Module {
  id: number;
  name: string;
  items: Item[];
  position: number;
}

interface Item {
  id: number;
  indent: number;
  title: string;
  type: string;
}

export default function Modules() {
  const router = useRouter()

  const { isSuccess, data } = useQuery(
    ["course", router.query.id, "modules"],
    async () => getData<Module[]>(`courses/${router.query.id}/modules?include=items`)
  );

  return (
    <div>
      <Header />

      {isSuccess ? <ModulesView data={data} /> : <Loader />}
    </div>
  );
}

function ModulesView(props: {data: Module[]}) {
  return (
    <main>
      {props.data.map((item) => (
        <div>{item.name}</div>
      ))}
    </main>
  )
}