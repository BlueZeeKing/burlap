import { sanitize } from "isomorphic-dompurify";
import { MutableRefObject } from "react";

export default function clean(html: string, ref: MutableRefObject<HTMLDivElement>) {
  ref.current.innerHTML = sanitize(html)
  ref.current.querySelectorAll("a").forEach((a) => {
    a.target = "_blank"
    a.classList.add("text-sky-400")
  })
  for (let item of ref.current.getElementsByTagName("*")) {
    const e = item as HTMLElement;
    if (e.style.getPropertyValue("background-color") != "" && !(e instanceof HTMLTableCellElement) && !isLink(e)) {
      e.style.setProperty("background-color", "")
      e.classList.add("bg-lime-300");
      e.classList.add("dark:bg-lime-700");
    } else if (e.style.getPropertyValue("background-color") != "" && isLink(e)) {
      e.style.setProperty("background-color", "")
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
  }
}

function isLink(e: HTMLElement): boolean {
  return e instanceof HTMLAnchorElement || e.firstChild instanceof HTMLAnchorElement;
}