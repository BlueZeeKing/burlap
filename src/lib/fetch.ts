import { fetch } from "@tauri-apps/api/http"

import { getKey } from "./auth";

export async function getData<T>(url: string) {
  const key = await getKey()
  const body = await fetch(`https://apsva.instructure.com/api/v1/${url}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${key}`,
    },
  });

  if (!body.ok) throw body.status

  return body.data as T
}