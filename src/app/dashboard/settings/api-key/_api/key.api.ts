import { keyService, GroqKeyItem, KeysSchema } from "../_services/key.service";

export const keyApi = {
  /**
   * Thêm mới API Key cho Groq (Tự động sinh ID tăng dần từ 1)
   */
  async addKey(key: string): Promise<void> {
    return await keyService.add(key);
  },

  /**
   * Xóa API Key của Groq dựa theo ID
   */
  async removeKey(id: number): Promise<void> {
    return await keyService.remove(id);
  },

  /**
   * Lấy danh sách tất cả key Groq (Đã sắp xếp theo ID tăng dần)
   * Trả về dạng: GroqKeyItem[] (ví dụ: [{id: 1, key: "..."}, {id: 2, key: "..."}])
   */
  async getKeys(): Promise<GroqKeyItem[]> {
    return await keyService.getKeys();
  },

  /**
   * Lấy toàn bộ cấu trúc file JSON (Phục vụ dữ liệu thô, backup hoặc debug)
   */
  async getAll(): Promise<KeysSchema> {
    return await keyService.load();
  },

  /**
   * Lấy chuỗi API Key phục vụ xử lý công việc:
   * - keyApi.getKey(3) -> Trả về chuỗi key của bản ghi có id = 3
   * - keyApi.getKey()  -> Trả về chuỗi key đầu tiên trong hệ thống (id nhỏ nhất)
   */
  async getKey(id?: number): Promise<string> {
    let apiKey = await keyService.getKey(id)
    // console.log("[SETTINGS:KEY.API] Api key đang sử dụng:", apiKey)
    return apiKey;
  }
};