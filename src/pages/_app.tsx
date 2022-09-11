import "../global.css";

import { ChakraProvider } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { useEffect } from "react";
import { useRouter } from "next/router";

import { loggedIn } from "../lib/auth";

export const queryClient = new QueryClient();

export default function MyApp({ Component, pageProps }) {
  const nav = useRouter();
  useEffect(() => {
    const func = async () => {
      if (!(await loggedIn()) && nav.pathname != "/start") {
        nav.push("/start");
      }
    };

    func();
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider>
        <ReactQueryDevtools />
        <Component {...pageProps} />
      </ChakraProvider>
    </QueryClientProvider>
  );
}
