export async function saveKey(key: string): Promise<void> {
  const { appDir, join } = await import("@tauri-apps/api/path");
  const { writeTextFile, createDir } = await import("@tauri-apps/api/fs");

  await createDir(await appDir());
  await writeTextFile(await join(await appDir(), "apikey.txt"), key);
}

export async function getKey(): Promise<string> {
  const { appDir, join } = await import("@tauri-apps/api/path");
  const { readTextFile } = await import("@tauri-apps/api/fs");

  return await readTextFile(await join(await appDir(), "apikey.txt"));
}

export async function loggedIn() {
  try {
    await getKey()
  } catch (e) {
    return false
  }
  return true
}