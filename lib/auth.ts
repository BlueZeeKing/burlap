import { readTextFile, writeTextFile } from "@tauri-apps/api/fs"
import { appDir, join } from "@tauri-apps/api/path";

export async function saveKey(key: string): Promise<void> {
  await writeTextFile(await join(await appDir(), "apikey.txt"), key);
}

export async function getKey(): Promise<string> {
  const data = await readTextFile(await join(await appDir(), "apikey.txt"));
  return data;
}

export async function loggedIn() {
  try {
    await getKey()
  } catch (e) {
    return false
  }
  return true
}