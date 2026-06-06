import { throwError } from "@/lib/error/error";

// Cấu trúc định dạng dữ liệu cho Groq
export interface GroqKeyItem {
  id: number;
  key: string;
}

export interface KeysSchema {
  groq: GroqKeyItem[];
}

const SECRET_FILENAME = "keys.json";
const SECRET_DIRECTORY = "system-secrets";

const createKeyService = () => {
  /**
   * Helper: Truy cập nhanh vào OPFS File Handle
   */
  const getFileHandle = async (create = false) => {
    const root = await navigator.storage.getDirectory();
    const dir = await root.getDirectoryHandle(SECRET_DIRECTORY, { create });
    return await dir.getFileHandle(SECRET_FILENAME, { create });
  };

  /**
   * Helper: Validate API Key cho Groq
   */
  const validateKey = async (key: string): Promise<boolean> => {
    if (!key.trim()) return false;
    
    const url = "https://api.groq.com/openai/v1/models";

    try {
      const res = await fetch(url, { headers: { Authorization: `Bearer ${key}` } });
      return res.ok;
    } catch {
      return false;
    }
  };

  return {
    async load(): Promise<KeysSchema> {
      try {
        const handle = await getFileHandle();
        const file = await handle.getFile();
        const content = await file.text();
        return content ? JSON.parse(content) : { groq: [] };
      } catch {
        return { groq: [] };
      }
    },

    async save(data: KeysSchema): Promise<void> {
      try {
        const handle = await getFileHandle(true);
        const writable = await handle.createWritable();
        await writable.write(JSON.stringify(data, null, 2));
        await writable.close();
      } catch (err) {
        throw new Error("Lưu thất bại: Không thể ghi vào hệ thống file trình duyệt.");
      }
    },

    /**
     * Chỉ lưu key của Groq kèm theo id tự động tăng dần từ 1
     */
    async add(key: string): Promise<void> {
      const trimmedKey = key.trim();
      if (!(await validateKey(trimmedKey))) {
        throw new Error(`API key cho Groq không hợp lệ hoặc bị trống.`);
      }

      const data = await this.load();
      const currentKeys = data.groq ?? [];

      // Kiểm tra trùng lặp chuỗi key
      const isExist = currentKeys.some(item => item.key === trimmedKey);
      if (isExist) {
        throw new Error("API key này đã tồn tại.");
      }

      // Tính toán ID tiếp theo (Tăng dần từ 1 dựa trên ID lớn nhất hiện tại)
      const nextId = currentKeys.length > 0 
        ? Math.max(...currentKeys.map(k => k.id)) + 1 
        : 1;

      const newKeyItem: GroqKeyItem = {
        id: nextId,
        key: trimmedKey
      };

      await this.save({
        ...data,
        groq: [...currentKeys, newKeyItem]
      });
    },

    /**
     * Xóa key dựa theo ID
     */
    async remove(id: number): Promise<void> {
      const data = await this.load();
      if (!data.groq) return;

      const filtered = data.groq.filter((item) => item.id !== id);
      
      await this.save({
        ...data,
        groq: filtered
      });
    },

    /**
     * Lấy danh sách key sắp xếp theo ID tăng dần
     */
    async getKeys(): Promise<GroqKeyItem[]> {
      const data = await this.load();
      return (data.groq ?? []).sort((a, b) => a.id - b.id);
    },

    /**
     * Lấy chính xác chuỗi API Key:
     * - Nếu truyền id: Tìm và trả về chính xác key của ID đó.
     * - Nếu không truyền id: Trả về key đầu tiên trong danh sách.
     */
    async getKey(id?: number): Promise<string> {
      const keys = await this.getKeys();
      
      if (!keys.length) {
        throwError('NOT_FOUND_KEY', "Không tìm thấy Api Key. Xem hướng dẫn cấu hình api key tại [đây](/guide)");
      }

      // 1. Nếu truyền ID -> Lấy chính xác theo ID
      if (id !== undefined) {
        const target = keys.find(item => item.id === id);
        if (!target) {
          throw new Error(`Không tìm thấy API Key với ID bằng ${id}`);
        }
        return target.key;
      }

      // 2. Nếu không truyền ID -> Mặc định lấy key đầu tiên
      return keys[0].key;
    }
  };
};

export const keyService = createKeyService();