import { OpfsCore } from "./OpfsCore";
import { getDeepHandle, splitPath } from "./utils";
import { OPFSEntry, WriteOptions, EntryType } from "./types";

export class OpfsRepository {
  private static instance: OpfsRepository;
  private root!: FileSystemDirectoryHandle;

  private constructor() {}

  static async getInstance(): Promise<OpfsRepository> {
    if (!OpfsRepository.instance) {
      const repo = new OpfsRepository();
      repo.root = await OpfsCore.getRoot();
      OpfsRepository.instance = repo;
    }
    return OpfsRepository.instance;
  }

  // thao tác với file
  async writeFile(
    path: string,
    content: Blob | string | ArrayBuffer,
    options: WriteOptions = {},
  ): Promise<void> {
    const { parent, fileName } = await getDeepHandle(this.root, path, {
      create: options.create,
    });
    const fileHandle = await parent.getFileHandle(fileName, {
      create: options.create,
    });

    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
  }

  async readFile(path: string): Promise<File> {
    const { parent, fileName } = await getDeepHandle(this.root, path);
    const fileHandle = await parent.getFileHandle(fileName);
    return await fileHandle.getFile();
  }

  /**
   * Ghi đè một phần nội dung file mà không làm mất dữ liệu cũ (Tối ưu cho file lớn)
   * @param path Đường dẫn file
   * @param content Nội dung mới cần chèn vào
   * @param position Vị trí bắt đầu ghi (mặc định là 0)
   */
  async patchFile(
    path: string,
    content: Blob | string | ArrayBuffer,
    position: number = 0,
  ): Promise<void> {
    const { parent, fileName } = await getDeepHandle(this.root, path);
    const fileHandle = await parent.getFileHandle(fileName);

    // keepExistingData: true giúp giữ lại nội dung cũ của file
    const writable = await fileHandle.createWritable({
      keepExistingData: true,
    });

    await writable.seek(position);
    await writable.write(content);
    await writable.close();
  }

  // thao tác với thư mục
  async listDirectory(path: string = "/"): Promise<OPFSEntry[]> {
    let targetDir = this.root;
    if (path !== "/" && path !== "") {
      const parts = splitPath(path);
      for (const part of parts) {
        targetDir = await targetDir.getDirectoryHandle(part);
      }
    }

    const entries: OPFSEntry[] = [];
    for await (const handle of targetDir.values()) {
      entries.push({
        name: handle.name,
        kind: handle.kind as EntryType,
        handle,
        path: `${path.endsWith("/") ? path : path + "/"}${handle.name}`,
      });
    }
    return entries;
  }

  async deleteEntry(path: string, recursive = false): Promise<void> {
    const { parent, fileName } = await getDeepHandle(this.root, path);
    await parent.removeEntry(fileName, { recursive });
  }

  // duyệt đệ quy toàn bộ hệ thống từ tập tin gốc
  async scanEntries(
    dirHandle: FileSystemDirectoryHandle,
    path: string = "",
  ): Promise<OPFSEntry[]> {
    const entries: OPFSEntry[] = [];

    for await (const handle of dirHandle.values()) {
      const currentPath = path ? `${path}/${handle.name}` : handle.name;

      const entry: OPFSEntry = {
        name: handle.name,
        kind: handle.kind as EntryType,
        handle,
        path: currentPath,
      };
      entries.push(entry);
      // Nếu là thư mục, tiếp tục đi sâu vào bên trong
      if (handle.kind === "directory") {
        const subEntries = await this.scanEntries(
          handle as FileSystemDirectoryHandle,
          currentPath,
        );
        entries.push(...subEntries);
      }
    }
    return entries;
  }

  async getAllFiles(): Promise<OPFSEntry[]> {
    return await this.scanEntries(this.root);
  }
}
