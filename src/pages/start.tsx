import { Button, Input } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useState } from "react";
import { saveKey } from "../lib/auth";

export default function App() {
  const [key, setKey] = useState("")
  const nav = useRouter()

  return (
    <div className="w-screen h-screen grid place-content-center p-16">
      <div>
        <h1 className="text-5xl font-bold text-center pb-8">
          Welcome to the Burlap beta!
        </h1>
        <p className="pb-4">
          As this is a beta there are risk associated with using this as your
          main way of accessing the Canvas service. Please continue only if you
          are aware of the risks
        </p>
        <div className="px-16 text-center">
          <Input placeholder="API Key" value={key} onChange={e => setKey(e.target.value)} />
          <Button colorScheme="blue" mt="2" onClick={async () => {
            saveKey(key);
            nav.push("/")
          }}>Submit</Button>
        </div>
      </div>
    </div>
  );
}
