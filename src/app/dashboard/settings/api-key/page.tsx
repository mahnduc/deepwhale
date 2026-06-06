"use client";

import { useState, useEffect, useCallback } from "react";
import { keyApi } from "./_api/key.api";
import { GroqKeyItem } from "./_services/key.service";
import { 
  Trash2, 
  Key, 
  AlertCircle, 
  CheckCircle2,
  Cpu,
  ShieldCheck
} from "lucide-react";

export default function ApiKeyTool() {
  const [apiKey, setApiKey] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [groqKeys, setGroqKeys] = useState<GroqKeyItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Lấy danh sách key từ API mới (được trả về dưới dạng mảng GroqKeyItem[])
  const fetchKeys = useCallback(async () => {
    try {
      const data = await keyApi.getKeys();
      setGroqKeys(data || []);
    } catch {
      setGroqKeys([]);
    }
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setMessage({ text: "Vui lòng nhập API Key", type: "error" });
      return;
    }
    setIsLoading(true);
    try {
      // API mới chỉ cần truyền trực tiếp chuỗi key, tự động tăng ID
      await keyApi.addKey(apiKey);
      setMessage({ text: "Đã lưu mã bảo mật thành công!", type: "success" });
      setApiKey("");
      await fetchKeys();
    } catch (err: any) {
      setMessage({ text: err.message || "Lỗi hệ thống", type: "error" });
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    }
  };

  const handleRemove = async (id: number) => {
    if (confirm(`Bạn có chắc chắn muốn xóa key có ID: ${id}?`)) {
      try {
        // API mới thực hiện xóa dựa trên ID kiểu số
        await keyApi.removeKey(id);
        await fetchKeys();
      } catch (err: any) {
        alert(err.message || "Không thể xóa key.");
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 p-6 font-['Nunito'] text-[#2D3436] animate-in fade-in duration-500">
      
      {/* HEADER SECTION */}
      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-[#2D3436]">
          Quản lý API Keys
        </h1>
        <p className="text-[#B2BEC3] font-semibold">
          Lưu trữ và bảo mật các mã truy cập dịch vụ AI Groq của bạn.
        </p>
      </header>

      <section className="bg-white border-2 border-[#F0F0F0] rounded-3xl p-8 shadow-[0_4px_0_0_#F0F0F0]">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-[#FFF0F7] rounded-xl text-[#FF3399]">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold">Cấu hình bảo mật</h2>
            <p className="text-sm text-[#B2BEC3] font-semibold">Thêm api mới vào hệ thống</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold ml-1">Mã API Key (Groq Entry Token)</label>
            <input 
              type="password" 
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="gsk_••••••••••••••••••••••••"
              className="w-full bg-[#F7F9FB] border-2 border-[#E0E0E0] rounded-2xl px-4 py-3 text-[15px] outline-none transition-all focus:border-[#FF3399] placeholder:text-[#B2BEC3]"
            />
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <button 
            onClick={handleSave}
            disabled={isLoading}
            className={`
              relative w-full sm:w-auto px-8 py-3 rounded-2xl font-bold text-white uppercase tracking-wider transition-all active:translate-y-0.5 active:shadow-none
              ${isLoading ? 'bg-[#B2BEC3] shadow-[0_4px_0_0_#929EAD]' : 'bg-[#FF3399] shadow-[0_4px_0_0_#D12A7E] hover:brightness-105'}
            `}
          >
            {isLoading ? "Đang xử lý..." : "Cập nhật"}
          </button>

          {message.text && (
            <div className={`flex items-center gap-2 font-bold text-sm px-4 py-2 rounded-full animate-in fade-in zoom-in duration-300 ${
              message.type === "error" ? "text-[#FF3399]" : "text-[#00CEC9]"
            }`}>
              {message.type === "error" ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
              {message.text}
            </div>
          )}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            Danh sách khóa đang hoạt động 
            <span className="bg-[#00CEC9] text-white text-[11px] px-2 py-1 rounded-full">
              {groqKeys.length}
            </span>
          </h2>
        </div>

        {groqKeys.length === 0 ? (
          <div className="border-2 border-dashed border-[#E0E0E0] rounded-3xl p-12 text-center bg-white">
            <div className="bg-[#F7F9FB] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-[#B2BEC3]">
              <Key size={32} />
            </div>
            <p className="text-[#B2BEC3] font-semibold">Chưa phát hiện mã khóa nào được lưu</p>
          </div>
        ) : (
          <div className="bg-white border-2 border-[#F0F0F0] rounded-[20px] overflow-hidden shadow-[0_2px_0_0_#F0F0F0]">
            <div className="px-5 py-4 bg-[#F7F9FB] border-b-2 border-[#F0F0F0] flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white rounded-lg border] border-[#E0E0E0] flex items-center justify-center text-[#FF3399]">
                  <Cpu size={16} />
                </div>
                <span className="font-extrabold uppercase text-[13px] tracking-wide">GROQ PROVIDER</span>
              </div>
              <span className="bg-[#E0E0E0] text-[#636E72] text-[10px] font-extrabold px-2 py-1 rounded-lg uppercase">
                {groqKeys.length} Nodes
              </span>
            </div>
            
            <div className="divide-y-[1.5px] divide-[#F0F0F0]">
              {groqKeys.map((item) => (
                <div key={item.id} className="px-5 py-4 flex justify-between items-center group hover:bg-[#FFF0F7]/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-extrabold text-[#B2BEC3] bg-[#F7F9FB] border w-6 h-6 rounded-full flex items-center justify-center">
                      #{item.id}
                    </span>
                    <Key size={14} className="text-[#B2BEC3]" />
                    <code className="text-[14px] font-semibold text-[#636E72] bg-[#F7F9FB] px-2 py-1 rounded-md border border-[#E0E0E0]">
                      {item.key.slice(0, 8)}••••{item.key.slice(-4)}
                    </code>
                  </div>
                  <button 
                    onClick={() => handleRemove(item.id)}
                    className="p-2 text-[#B2BEC3] hover:text-[#FF3399] hover:bg-[#FFF0F7] rounded-full transition-all"
                    title="Xóa khóa này"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}