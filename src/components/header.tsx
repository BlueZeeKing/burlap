import { Avatar } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { getData } from "../lib/fetch";

interface User {
  avatar_url: string;
  short_name: string;
  pronouns: string;
  id: number;
}

export default function Header() {
  const { data, isSuccess } = useQuery(["profile"], async () => await getData<User>("users/self/profile"));

  console.log(data);

  return (
    <div className="h-24 bg-white border-b border-zinc-300 flex">
      <Link href="/">
        <h1 className="text-3xl pl-6 grid content-center cursor-pointer">Burlap</h1>
      </Link>
      <div className="flex-grow"></div>
      <Link href="messages">
        <span className="text-blue-500 cursor-pointer hover:underline grid content-center px-5">
          Messages
        </span>
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
