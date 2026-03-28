export const splitPath = (path: string): string[] => 
  path.split('/').filter(p => p.length > 0);

export async function getDeepHandle(
  root: FileSystemDirectoryHandle, 
  path: string, 
  options: { create?: boolean } = {}
): Promise<{ parent: FileSystemDirectoryHandle; fileName: string }> {
  const parts = splitPath(path);
  const fileName = parts.pop();
  
  if (!fileName) throw new Error("Path không hợp lệ");

  let current = root;
  for (const part of parts) {
    current = await current.getDirectoryHandle(part, options);
  }

  return { parent: current, fileName };
}