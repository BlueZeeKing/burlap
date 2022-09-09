import { Spinner } from "@chakra-ui/react";

export default function Loader() {
  return (
    <main className="w-full p-16 bg-zinc-200 dark:bg-zinc-900 grid place-content-center"><Spinner size="xl" /></main>
  )
}