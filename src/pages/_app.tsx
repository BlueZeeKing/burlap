import "../global.css";

import { ChakraProvider, createStandaloneToast } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { useEffect } from "react";
import { useRouter } from "next/router";

import { loggedIn } from "../lib/auth";

const { ToastContainer, toast } = createStandaloneToast();

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      cacheTime: 180 * 1000,
      onError: (error: string) => {
        toast({
          title: "An error occurred.",
          description: error,
          status: "error",
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
      }
    },
  },
});

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
        <ToastContainer />
        <ReactQueryDevtools position="bottom-right" />
        <Component {...pageProps} />
      </ChakraProvider>
    </QueryClientProvider>
  );
}
