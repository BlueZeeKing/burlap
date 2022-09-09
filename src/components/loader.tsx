import { Spinner } from "@chakra-ui/react";

export default function Loader() {
  return (
    <main className="w-full p-16 bg grid place-content-center"><Spinner size="xl" /></main>
  )
}