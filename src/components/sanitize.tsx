import sanitize from "../lib/sanitize";
import { ReactNode, useEffect, useRef } from "react";

export default function Sanitizer(props: { html: string; header?: ReactNode}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    sanitize(props.html, ref);
  }, [props.html]);

  return (
    <main className="bg p-6 flex flex-col space-y-6 place-items-center px-24">
      <div className="prose dark:prose-invert bg-zinc-800 p-8 md:prose-lg lg:prose-xl max-w-[100ch]">
        {
          props.header != null ? (
            <>
              {props.header}
              <hr />
            </>
          ) : ""
        }
        <div ref={ref} />
      </div>
    </main>
  );
}