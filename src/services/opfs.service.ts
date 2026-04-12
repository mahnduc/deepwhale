/**
 * OPFS Service - Xử lý lưu trữ file hệ thống cục bộ của trình duyệt
 */
export const OpfsService = {
  /**
   * Lưu nội dung vào một file (Ghi đè nếu đã tồn tại)
   */
  async writeFile(path: string, content: string | Blob): Promise<void> {
    const root = await navigator.storage.getDirectory();
    const parts = path.split("/");
    const fileName = parts.pop()!;
    
    let currentDir = root;
    
    // Tạo thư mục nếu đường dẫn có chứa folder
    for (const part of parts) {
      currentDir = await currentDir.getDirectoryHandle(part, { create: true });
    }

    const fileHandle = await currentDir.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
  },

  /**
   * Đọc nội dung file
   */
  async readFile(path: string): Promise<File> {
    const root = await navigator.storage.getDirectory();
    const parts = path.split("/");
    const fileName = parts.pop()!;
    
    let currentDir = root;
    for (const part of parts) {
      currentDir = await currentDir.getDirectoryHandle(part);
    }

    const fileHandle = await currentDir.getFileHandle(fileName);
    return await fileHandle.getFile();
  },

  /**
   * Xóa file hoặc thư mục
   */
  async remove(path: string): Promise<void> {
    const root = await navigator.storage.getDirectory();
    const parts = path.split("/");
    const target = parts.pop()!;
    
    let currentDir = root;
    for (const part of parts) {
      currentDir = await currentDir.getDirectoryHandle(part);
    }

    await currentDir.removeEntry(target, { recursive: true });
  }
};