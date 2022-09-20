import { Button } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { NextRouter, useRouter } from "next/router";
import { getData } from "../lib/fetch";
import { ItemWrapper } from "../pages/courses/[course]/modules";
import { queryClient } from "../pages/_app";
import { Assignment, Item, Page, File } from "../types/api";
import PrefetchWrapper from "./prefetcher";

interface Sequence {
  items: {
    next: Item | undefined;
    prev: Item | undefined;
  }[];
}

export default function SequenceButtons() {
  const router = useRouter()

  const { data, isSuccess } = useQuery(
    ["courses", router.query.course, "moduleitem", router.query.moduleItem],
    async () => await getData<Sequence>(`courses/${router.query.course}/module_item_sequence?asset_type=ModuleItem&asset_id=${router.query.moduleItem}`),
  );

  if (isSuccess && data.items.length > 0) {
    return (
      <div>
        <hr className="mx-10" />
        <div className="flex p-6">
          {data.items[0].prev != null ? (
            <PrefetchWrapper prefetch={() => prefetchData(data.items[0].prev, router)}>
            <ItemWrapper data={data.items[0].prev} router={router}>
              <Button>Previous</Button>
            </ItemWrapper>
            </PrefetchWrapper>
          ) : (
            ""
          )}
          <div className="flex-grow" />
          {data.items[0].next != null ? (
            <PrefetchWrapper prefetch={() => prefetchData(data.items[0].next, router)}>
              <ItemWrapper data={data.items[0].next} router={router}>
                <Button>Next</Button>
              </ItemWrapper>
            </PrefetchWrapper>
          ) : (
            ""
          )}
        </div>
      </div>
    );
  } else {
    return <></>;
  }
}

export function prefetchData(data: Item, router: NextRouter) {
  switch (data.type) {
    case "Assignment":
      queryClient.prefetchQuery(
        ["courses", router.query.course, "assignments", data.content_id.toString()],
        async () =>
          getData<Assignment>(
            `courses/${router.query.course}/assignments/${data.content_id}`
          )
      );
      break;
    case "File":
      queryClient.prefetchQuery(
        ["courses", router.query.course, "file", data.content_id.toString()],
        async () =>
          await getData<File>(
            `courses/${router.query.course}/files/${data.content_id}`
          )
      );
      break;
    case "Page":
      queryClient.prefetchQuery(
        ["courses", router.query.course, "pages", data.page_url.toString()],
        async () =>
          getData<Page>(`courses/${router.query.course}/pages/${data.page_url}`)
      );
      break;
  }
}