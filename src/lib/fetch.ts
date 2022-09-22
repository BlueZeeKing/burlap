import {fetch, Body} from "@tauri-apps/api/http"
import jsFetch from "./fetchWrapper"

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

export async function submitAssignment<T>(course: string, assignment: string, query: Record<string, any>) {
  const key = await getKey();
  const body = await fetch(
    `https://apsva.instructure.com/api/v1/courses/${course}/assignments/${assignment}/submissions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
      },
      query: query
    }
  );

  if (!body.ok) throw body.status;

  return body.data as T;
}

export async function uploadFile(url: string, name: string, fileData: Uint8Array) {
  const key = await getKey();
  const body: { ok: boolean; data: { upload_params: {[key: string]: string}, upload_url: string }; status: any } =
    await fetch(`https://apsva.instructure.com/api/v1/${url}`, {
      method: "POST",
      body: Body.form({
        name: name,
        size: fileData.length.toString(),
      }),
      headers: {
        Authorization: `Bearer ${key}`,
      },
    });

  if (!body.ok) throw body.status;

  const formData = new FormData()

  Object.entries(body.data.upload_params).forEach(([key, value])  => formData.append(key, value))

  formData.append("file", new Blob([fileData]))

  const fileUpload = await jsFetch(body.data.upload_url, {
    method: "POST",
    body: formData,
  }); // : {ok: boolean, data: {id: string}, status: unknown}

  console.log(fileUpload);

  if (!fileUpload.ok) return;

  const response = await fileUpload.json();
  console.log(response)

  return response.id;
}