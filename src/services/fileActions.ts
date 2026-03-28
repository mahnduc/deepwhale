import { OpfsRepository } from "@/lib/opfs";

// tạo file mới || ghi đè toàn bộ
export const actionSaveFile = async (path: string, data: Blob | string) => {
  try {
    const storage = await OpfsRepository.getInstance();
    await storage.writeFile(path, data, { create: true });
    return { success: true };
  } catch (error) {
    console.error("Lỗi khi lưu file:", error);
    throw error;
  }
};

// xóa file || thư mục
export const actionDeleteEntry = async (path: string) => {
  try {
    const storage = await OpfsRepository.getInstance();
    // recursive: true để xóa thư mục chứa tệp bên trong
    await storage.deleteEntry(path, true);
    return { success: true };
  } catch (error) {
    console.error("Lỗi khi xóa:", error);
    throw error;
  }
};

/**
 * chỉnh sửa tối ưu (dành cho file lớn)
 * Ví dụ: Sửa metadata ở đầu file hoặc ghi thêm vào cuối file
 */
export const actionEditLargeFile = async (path: string, newChunk: string, atIndex: number = 0) => {
  try {
    const storage = await OpfsRepository.getInstance();
    // Sử dụng patchFile để ghi đè đúng vị trí mà không load cả file vào RAM
    await storage.patchFile(path, newChunk, atIndex);
    
    return { success: true };
  } catch (error) {
    console.error("Lỗi khi sửa file lớn:", error);
    throw error;
  }
};

// ghi thêm vào cuối file (append)
export const actionAppendToFile = async (path: string, extraData: string) => {
  try {
    const storage = await OpfsRepository.getInstance();
    const file = await storage.readFile(path);
    // Vị trí bắt đầu ghi chính là độ lớn hiện tại của file
    await storage.patchFile(path, extraData, file.size);
    
    return { success: true };
  } catch (error) {
    console.error("Lỗi khi append file:", error);
    throw error;
  }
};

/**
 * ACTION: LẤY TOÀN BỘ DANH SÁCH FILE ĐỂ HIỂN THỊ
 */
export const actionFetchAllFiles = async () => {
  try {
    const storage = await OpfsRepository.getInstance();
    const allEntries = await storage.getAllFiles();
    
    // Sắp xếp: Thư mục hiện lên trước, file hiện sau, theo bảng chữ cái
    return allEntries.sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === 'directory' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  } catch (error) {
    console.error("Lỗi khi quét hệ thống file:", error);
    return [];
  }
};

/**
 * ACTION: UPLOAD FILE TỪ MÁY TÍNH
 * Chấp nhận một đối tượng File từ input và lưu vào OPFS
 */
export const actionUploadFile = async (destPath: string, file: File) => {
  try {
    const storage = await OpfsRepository.getInstance();
    // Sử dụng trực tiếp đối tượng file (là một Blob) để ghi
    await storage.writeFile(destPath, file, { create: true });
    return { success: true };
  } catch (error) {
    console.error("Lỗi khi upload file:", error);
    throw error;
  }
};