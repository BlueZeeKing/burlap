import { ReactNode, useEffect, useRef } from "react";
import { sanitize } from "isomorphic-dompurify";
import { MutableRefObject } from "react";
import { LinkType } from "../types/api";
import { NextRouter, useRouter } from "next/router";

export default function Sanitizer(props: { html: string; header?: ReactNode}) {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter()

  useEffect(() => {
    clean(props.html, ref, router);
  }, [props.html]);

  return (
    <main className="bg p-6 flex flex-col space-y-6 place-items-center">
      <div className="prose dark:prose-invert bg-zinc-800 p-8 lg:prose-lg max-w-[75ch] w-full">
        {
          props.header != null ? (
            <>
              {props.header}
              <hr className="!m-8" />
            </>
          ) : ""
        }
        <div ref={ref} />
      </div>
    </main>
  );
}

export function clean(
  html: string,
  ref: MutableRefObject<HTMLDivElement>,
  router: NextRouter
) {
  ref.current.innerHTML = sanitize(html);
  ref.current.querySelectorAll("a").forEach((a) => {
    if (a.getAttribute("data-api-returntype") != null) {
      const type = a.getAttribute("data-api-returntype") as LinkType;
      const url = new URL(a.getAttribute("href"));
      switch (type) {
        case "Module":
          a.href = url.pathname.split("/").slice(0, 4).join("/");
          break;
        default:
          a.href = url.pathname;
          break;
      }
      a.onclick = (e) => {
        e.preventDefault()
        router.push(a.href, a.href, {
          shallow: true
        })
      }
    } else if (a.href.startsWith("http")) {
      a.target = "_blank";
    }
    a.classList.add("text-sky-400");
  });
  for (let item of ref.current.getElementsByTagName("*")) {
    const e = item as HTMLElement;
    if (
      e.style.getPropertyValue("background-color") != "" &&
      !(e instanceof HTMLTableCellElement) &&
      !isLink(e)
    ) {
      e.style.setProperty("background-color", "");
      e.classList.add("bg-lime-300");
      e.classList.add("dark:bg-lime-700");
    } else if (
      e.style.getPropertyValue("background-color") != "" &&
      isLink(e)
    ) {
      e.style.setProperty("background-color", "");
      e.classList.add("font-bold");
      e.firstElementChild?.classList.add("font-bold");
    }
    if (e.style.getPropertyValue("font-size") != "") {
      let size = parseInt(e.style.getPropertyValue("font-size"));
      if (size > 30) {
        e.classList.add("text-3xl");
      } else if (size > 24) {
        e.classList.add("text-2xl");
      } else if (size > 20) {
        e.classList.add("text-xl");
      } else if (size > 18) {
        e.classList.add("text-lg");
      } else if (size > 16) {
        e.classList.add("text-base");
      } else if (size < 14) {
        e.classList.add("text-sm");
      } else if (size < 12) {
        e.classList.add("text-xs");
      }
      e.style.setProperty("font-size", "");
    }
    if (e.style.getPropertyValue("color") != "") {
      e.style.setProperty("color", "");
    }
    if (e.style.getPropertyValue("width") != "") {
      e.style.setProperty("width", "");
    }
    if (!(e instanceof HTMLImageElement)) {
      try {
        (e as any).width = undefined;
      } catch (e) {
        console.error(e);
      }
    }
  }
}

function isLink(e: HTMLElement): boolean {
  return (
    e instanceof HTMLAnchorElement || e.firstChild instanceof HTMLAnchorElement
  );
}