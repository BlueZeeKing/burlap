import { Text, useDisclosure, Heading } from "@chakra-ui/react";
import {
  faChevronDown,
  faChevronUp,
  faPenRuler,
  faFile,
  faLink,
  faNewspaper,
  faComment,
  faSquareCheck,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import Header from "../../../components/header";
import Loader from "../../../components/loader";

import { useQuery } from "@tanstack/react-query";
import { NextRouter, useRouter } from "next/router";

import { getData } from "../../../lib/fetch";
import { CourseLayout } from "../../../components/layout";

import { Module, Item, Type } from "../../../types/api";
import { queryClient } from "../../_app";

export default function Modules() {
  const router = useRouter()

  const { isSuccess, data } = useQuery(
    ["courses", router.query.course, "modules"],
    async () => getData<Module[]>(`courses/${router.query.course}/modules?include=items`),
  );

  return (
    <CourseLayout isSuccess={isSuccess}>
      <ModulesView data={data} />
    </CourseLayout>
  );
}

function ModulesView(props: {data: Module[]}) {
  const router = useRouter();

  return (
    <main className="bg p-6 flex flex-col space-y-6">
      {props.data.map((item) => <Module router={router} key={item.id} module={item} />)}
    </main>
  );
}

function Module(props: {module: Module; router: NextRouter}) {
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
          {props.module.items.map((item) =>
            item.type == "SubHeader" ? (
              <Heading
                cursor="pointer"
                p="4"
                pl={4 + item.indent * 4}
                key={item.id}
                as="h2"
                size="md"
              >
                {item.title}
              </Heading>
            ) : (
              <ItemWrapper data={item} router={props.router} key={item.id}>
                <Text
                  cursor="pointer"
                  className="hover:underline"
                  p="4"
                  pl={4 + item.indent * 4}
                >
                  {
                    <FontAwesomeIcon
                      icon={getIcon(item.type)}
                      className="pr-4 pl-2"
                    />
                  }
                  {item.title}
                </Text>
              </ItemWrapper>
            )
          )}
        </div>
      ) : (
        ""
      )}
    </div>
  );
}

function getIcon(type: Type) {
  switch (type) {
    case "Assignment": return faPenRuler;
    case "Discussion": return faComment;
    case "ExternalTool": return faLink;
    case "ExternalUrl": return faLink;
    case "File": return faFile;
    case "Page": return faNewspaper;
    case "Quiz": return faSquareCheck;
    case "SubHeader": return undefined;
  }
}

export function ItemWrapper(props: { children: JSX.Element; data: Item; router: NextRouter }): JSX.Element {
  const { children, data, router } = props;

  switch (data.type) {
    case "Assignment":
      return <Link href={["/courses", router.query.course, "assignments", data.content_id].join("/") + `?moduleItem=${data.id}`}>{children}</Link>;
    case "Discussion":
      return <Link href="/">{children}</Link>;
    case "ExternalTool":
      return <Link href="/">{children}</Link>;
    case "ExternalUrl":
      return <a href={data.external_url} target="_blank">{children}</a>;
    case "File":
      return <Link href={["/courses", router.query.course, "files", data.content_id].join("/") + `?moduleItem=${data.id}`}>{children}</Link>;
    case "Page":
      return <Link href={["/courses", router.query.course, "pages", data.page_url].join("/") + `?moduleItem=${data.id}`}>{children}</Link>;
    case "Quiz":
      return <Link href="/">{children}</Link>;
    case "SubHeader":
      return children;
  }
}