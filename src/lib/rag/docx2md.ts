import { convertToHtml } from "mammoth";
import TurndownService from "turndown";

async function getFileHandleFromPath(
  root: FileSystemDirectoryHandle, 
  path: string, 
  options?: FileSystemGetFileOptions
): Promise<FileSystemFileHandle> {
  const parts = path.split(/[/\\]/).filter(Boolean);
  const fileName = parts.pop();
  
  let currentDir = root;
  
  for (const part of parts) {
    currentDir = await currentDir.getDirectoryHandle(part, { create: options?.create });
  }
  
  if (!fileName) {
    throw new Error(`Đường dẫn không hợp lệ: ${path}`);
  }
  
  return await currentDir.getFileHandle(fileName, options);
}

export async function convertDocxToMdInOPFS(docxFilePath: string): Promise<string> {
  const root = await navigator.storage.getDirectory();
  
  const docxFileHandle = await getFileHandleFromPath(root, docxFilePath);
  const docxFile = await docxFileHandle.getFile();
  const arrayBuffer = await docxFile.arrayBuffer();

  const result = await convertToHtml({ arrayBuffer });
  const htmlContent = result.value; 

  const turndownService = new TurndownService({
    headingStyle: "atx", 
    hr: "---",
    bulletListMarker: "*",
    strongDelimiter: "**",
    emDelimiter: "_"
  });
  
  const markdownContent = turndownService.turndown(htmlContent);

  const mdFilePath = docxFilePath.replace(/\.docx$/i, '.md');

  const mdFileHandle = await getFileHandleFromPath(root, mdFilePath, { create: true });
  const writable = await mdFileHandle.createWritable();
  await writable.write(markdownContent);
  await writable.close();

  return mdFilePath;
}