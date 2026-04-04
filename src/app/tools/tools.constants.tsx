// src/constants/tools.constants.tsx
import { Code2, Folder, Key, SquaresSubtract } from "lucide-react";
import { ToolItem } from "./tool.types";

export const TOOLS_LIST: ToolItem[] = [
  { 
    id: 1, 
    name: "OPFS Explorer", 
    path: "opfs-explorer", 
    description: "Trình quản lý thư mục ảo.", 
    icon: <Folder size={22} /> 
  },
  { 
    id: 4, 
    name: "Code Executor", 
    path: "code-executor", 
    description: "Chạy mã Python trực tiếp trong sandbox.", 
    icon: <Code2 size={22} /> 
  },
    { 
    id: 2, 
    name: "toMarkdown", 
    path: "tomarkdown", 
    description: "Công cụ chuyển đổi tài liệu thành markdown.", 
    icon: <SquaresSubtract size={22} /> 
  },
  { 
    id: 5, 
    name: "API Key", 
    path: "api-key", 
    description: "Quản lý api key người dùng.", 
    icon: <Key size={22} /> 
  }
];