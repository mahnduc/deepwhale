import { Database } from "lucide-react";

export const Step2 = () => (
  <div className="flex flex-col items-center text-center space-y-4 animate-in fade-in slide-in-from-bottom-4">
    <div className="p-4 bg-purple-500/10 rounded-full text-purple-500"><Database size={32} /></div>
    <h3>Khởi tạo Vector DB</h3>
    <p className="text-sm text-[var(--color-ui-text-muted)]">Hệ thống đang chuẩn bị nhúng (embedding) dữ liệu vào kho tri thức.</p>
  </div>
);