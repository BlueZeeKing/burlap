import { Avatar, Badge, Img } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { getData } from "../lib/fetch";
import { queryClient } from "../pages/_app";
import { User, Unread, DashboardCourse } from "../types/api";
import PrefetchWrapper from "./prefetcher";


export default function Header(props: {text?: string}) {
  const { data, isSuccess } = useQuery(["profile"], async () => await getData<User>("users/self/profile"));
  const unread = useQuery(["unread"], async () => await getData<Unread>("conversations/unread_count"), {staleTime: 500});

  return (
    <div className="h-24 bg-white dark:bg-zinc-800 border-b border-zinc-300 dark:border-zinc-700 flex col-span-2">
      <div className="h-full p-4">
        <PrefetchWrapper className="h-full aspect-square" prefetch={() => queryClient.prefetchQuery(["dashboard"], async () => await getData<DashboardCourse[]>("dashboard/dashboard_cards"))}>
          <Logo className="cursor-pointer" />
        </PrefetchWrapper>
      </div>
      <h1 className="text-2xl grid content-center">{props.text}</h1>
      <div className="flex-grow"></div>
      <Link href="messages">
        <div className="h-full grid content-center px-5">
          <span className="text-blue-500 dark:text-blue-400 cursor-pointer hover:underline relative">
            Messages
            <Badge ml="1" colorScheme="red">
              {unread.isSuccess && parseInt(unread.data.unread_count) > 0
                ? `${unread.data.unread_count} new`
                : ""}
            </Badge>
          </span>
        </div>
      </Link>
      {isSuccess ? (
        <Link href="/profile">
          <div className="grid content-center mr-4">
            <Avatar
              ml="2"
              cursor="pointer"
              src={data.avatar_url}
              name={data.short_name}
            />
          </div>
        </Link>
      ) : (
        <div className="grid content-center mr-4">
          <Avatar ml="2" />
        </div>
      )}
    </div>
  );
}

function Logo(props: { className?: string }) {
  return (
    <Link href="/">
      <svg
        viewBox="0 0 650 650"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        className={props.className}
      >
        <path
          d="M505.005107,0 L618,123.673802 L555.504716,185.512506 L618,245.456441 L555.504716,311.080176 L618,375.43923 L555.504716,437.908021 L618,499.11213 L499.3238,619 L498.693247,619 L438.093536,556.534814 L375.598252,619 L374.967699,619 L311.211706,556.534814 L246.190495,619 L245.559942,619 L185.590585,556.534814 L124.356912,619 L123.095843,619 L0,499.11213 L62.4952838,437.908021 L0,375.43923 L62.4952838,311.080176 L0,245.456441 L62.4952838,185.512506 L0,123.673802 L129.407559,0 L190.00727,62.4687913 L251.872199,0 L313.102265,62.4687913 L375.597549,0 L439.353542,62.4687913 L505.005107,0 Z M123.017374,261.2 L87.84,261.2 L87.84,341 L123.017374,341 C134.035343,341 142.967623,332.06772 142.967623,321.049751 C142.967623,310.031782 134.036338,301.100497 123.017374,301.100497 C134.035343,301.100497 142.967623,292.168218 142.967623,281.150249 C142.967623,270.13228 134.036338,261.2 123.017374,261.2 Z M230.796995,261.2 L150.996,261.2 L150.996,303.793601 C150.996,324.342319 170.34778,341.000002 190.896497,341.000002 C211.445215,341.000002 230.796995,324.342319 230.796995,303.793601 L230.796995,261.2 Z M286.289563,261.2 L238.776,261.2 L238.776,341 L306.239812,341 L286.289563,301.100497 C297.308527,301.100497 306.239812,292.168218 306.239812,281.150249 C306.239812,270.13228 297.308527,261.2 286.289563,261.2 Z M351.450399,261.2 L314.244,261.2 L314.244,341 L382.634342,341 L382.634342,303.793601 L351.450399,303.793601 L351.450399,261.2 Z M430.524497,261.2 L390.624,341 L470.424,341 L430.524497,261.2 Z M513.581374,261.2 L478.404,261.2 L478.404,341 L513.835872,341 L513.835872,301.100497 C524.853841,301.100497 533.531623,292.168218 533.531623,281.150249 C533.531623,270.13228 524.600338,261.2 513.581374,261.2 Z"
          className="fill-black dark:fill-white"
        ></path>
      </svg>
    </Link>
  );
}