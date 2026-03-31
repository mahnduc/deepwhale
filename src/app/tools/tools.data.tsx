// tools.data.ts

import { Box, Code2, Cpu, Folder, Globe, Key } from "lucide-react";

export interface ToolItem {
  id: number;
  name: string;
  path: string;
  description: string;
  icon: React.ReactNode;
}

export const tools: ToolItem[] = [
  { 
    id: 1, 
    name: "OPFS Explorer", 
    path: "opfs-explorer", 
    description: "Trình quản lý thư mục ảo.", 
    icon: <Folder size={22} /> 
  },
  { 
    id: 2, 
    name: "RAG Engine", 
    path: "rag-engine", 
    description: "Truy xuất dữ liệu tăng cường cho AI.", 
    icon: <Box size={22} /> 
  },
  { 
    id: 3, 
    name: "Web Scraper", 
    path: "web-scraper", 
    description: "Trích xuất dữ liệu từ các trang web.", 
    icon: <Globe size={22} /> 
  },
  { 
    id: 4, 
    name: "Code Executor", 
    path: "code-executor", 
    description: "Chạy mã Python trực tiếp trong sandbox.", 
    icon: <Code2 size={22} /> 
  },
  { 
    id: 5, 
    name: "API Key", 
    path: "api-key-manager", 
    description: "Quản lý api key người dùng.", 
    icon: <Key size={22} /> 
  }
];