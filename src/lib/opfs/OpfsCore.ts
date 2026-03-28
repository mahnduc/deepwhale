export class OpfsCore {
  private static instance: FileSystemDirectoryHandle | null = null;

  private constructor() {}

  public static async getRoot(): Promise<FileSystemDirectoryHandle> {
    if (!this.instance) {
      if (!navigator.storage || !navigator.storage.getDirectory) {
        throw new Error("Trình duyệt không hỗ trợ OPFS.");
      }
      this.instance = await navigator.storage.getDirectory();
    }
    return this.instance;
  }
}