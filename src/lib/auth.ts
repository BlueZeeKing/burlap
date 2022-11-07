export async function saveKey(key: string): Promise<void> {
  window.electronAPI.saveKey(key)
}

export async function getKey(): Promise<string | undefined> {
  return window.electronAPI.getKey()
}
