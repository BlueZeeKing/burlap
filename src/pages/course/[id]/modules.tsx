import { Text, useDisclosure } from "@chakra-ui/react";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useState } from "react";
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
    <main className="bg p-6 flex flex-col space-y-6">
      {props.data.map((item) => <Module key={item.id} module={item} />)}
    </main>
  );
}

function Module(props: {module: Module}) {
  const { isOpen, onToggle } = useDisclosure()

  return (
    <div>
      <div
        className="bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 border p-5 rounded cursor-pointer flex z-20 relative"
        onClick={onToggle}
      >
        <h2>{props.module.name}</h2>
        <div className="flex-grow"></div>
        <div className="grid content-center">
          <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} />
        </div>
      </div>
      {isOpen ? (
        <div className="bg-[#222224] -translate-y-1 z-10 relative pt-1 rounded-b mx-1">
          {props.module.items.map((item) => (
            <Text p="4" pl={4+item.indent*4} key={item.id}>{item.title}</Text>
          ))}
        </div>
      ) : (
        ""
      )}
    </div>
  );
}