import { useRouter } from "next/router";
import { useEffect } from "react";

export default function App() {
  const nav = useRouter();

  useEffect(() => {
    const func = async () => {
      if (!(await (await import("../../lib/auth")).loggedIn())) {
        nav.push("/start");
      }
    };

    func();
  });
  
  return <h1>hi</h1>
}