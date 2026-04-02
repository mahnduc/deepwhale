import type { ApiKeyEntry } from "./api-key.schema";

const DIR_NAME = "system-agents";
const FILE_NAME = "api-keys.json";

export async function loadApiKeys(): Promise<ApiKeyEntry[]> {
  try {
    const root = await navigator.storage.getDirectory();
    const dir = await root.getDirectoryHandle(DIR_NAME, { create: false });
    const fileHandle = await dir.getFileHandle(FILE_NAME, { create: false });

    const file = await fileHandle.getFile();
    const content = await file.text();

    return content ? JSON.parse(content) : [];
  } catch (error) {
    if (error instanceof Error && error.name === 'NotFoundError') {
      return [];
    }
    // console.warn("Lưu trữ OPFS chưa có dữ liệu hoặc bị chặn.");
    return [];
  }
}

export async function saveApiKeys(updatedKeys: ApiKeyEntry[]) {
  if (!updatedKeys || updatedKeys.length === 0) return;

  try {
    const root = await navigator.storage.getDirectory();
    const dir = await root.getDirectoryHandle(DIR_NAME, { create: true });
    const fileHandle = await dir.getFileHandle(FILE_NAME, { create: true });
    const writable = await fileHandle.createWritable();
    const jsonString = JSON.stringify(updatedKeys, null, 2);
    await writable.write(jsonString);
    await writable.close();
  } catch (error) {
    // console.error("Lỗi khi ghi file vào OPFS:", error);
    throw new Error("Không thể lưu API Key vào hệ thống.");
  }
}