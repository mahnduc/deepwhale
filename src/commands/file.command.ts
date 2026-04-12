import { OpfsService } from "@/services/opfs.service";
import { toast } from "sonner";

// Định nghĩa Interface cho dữ liệu đầu vào
export interface FilePayload {
  path: string;
  content: string;
}

// Định nghĩa Interface cho phản hồi
export interface CommandResponse {
  success: boolean;
  content?: string;    // Dùng cho lệnh Load
  timestamp?: number;  // Dùng cho lệnh Save
  error?: unknown;     // Dùng khi có lỗi
}

export const FileCommands = {
  /**
   * Command lưu file kèm thông báo UI và trả về timestamp
   */
  save: async (payload: FilePayload): Promise<CommandResponse> => {
    try {
      await OpfsService.writeFile(payload.path, payload.content);
      
      const timestamp = Date.now();
      toast.success(`Đã lưu file: ${payload.path}`);
      
      return { 
        success: true, 
        timestamp 
      };
    } catch (error) {
      console.error("OPFS Save Error:", error);
      toast.error("Không thể lưu file vào bộ nhớ trình duyệt");
      
      return { 
        success: false, 
        error 
      };
    }
  },

  /**
   * Command tải file
   */
  load: async (path: string): Promise<CommandResponse> => {
    try {
      const file = await OpfsService.readFile(path);
      const content = await file.text();
      
      return { 
        success: true, 
        content 
      };
    } catch (error) {
      console.error("OPFS Load Error:", error);

      return { 
        success: false, 
        content: undefined, 
        error 
      };
    }
  }
};