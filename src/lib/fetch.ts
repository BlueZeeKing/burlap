import { fetch } from "@tauri-apps/api/http"

import { getKey } from "./auth";

export async function getData<T>(url: string) {
  const body = await fetch(`https://apsva.instructure.com/api/v1/${url}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${await getKey()}`,
    },
  });

  if (!body.ok) throw body.status

  return body.data as T
}