import "../global.css"
import { ChakraProvider } from "@chakra-ui/react";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { loggedIn } from "../../lib/auth";

const queryClient = new QueryClient();

export default function MyApp({ Component, pageProps }) {
  const nav = useRouter();
  useEffect(() => {
    const func = async () => {
      if (!(await loggedIn())) {
        nav.push("/start");
      }
    };

    func();
  });
  
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider>
        <Component {...pageProps} />
      </ChakraProvider>
    </QueryClientProvider>
  );
}
