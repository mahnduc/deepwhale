"use client";

import { Sparkles, CheckCircle2, BookOpen, Clock, Target } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

// --- INTERFACES ĐỒNG BỘ CHÍNH XÁC 100% VỚI PAYLOAD CỦA AGENT ---
interface TimetableTask {
  day: string;
  durationMinutes: number;
  actionItems: string[];
}

interface QuizTimetablePayload {
  timetableName: string;
  quizTitle: string;
  createdAt: string;
  overallStrategySummary: string;
  schedule: TimetableTask[];
}

// Cấu trúc bọc ngoài từ tệp JSON được ghi trong OPFS
interface OpfsFilePayload {
  timetableData: QuizTimetablePayload;
}

export default function TimeTable() {
  const [fileList, setFileList] = useState<string[]>([]);
  const [selectedFilename, setSelectedFilename] = useState<string>("");
  const [timetable, setTimetable] = useState<QuizTimetablePayload | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Quét danh sách các file cấu hình trong thư mục "timetable" của OPFS
  useEffect(() => {
    async function loadFileList() {
      if (typeof navigator === "undefined" || !navigator.storage) {
        setError("Trình duyệt hiện tại không hỗ trợ API lưu trữ OPFS.");
        return;
      }
      try {
        const root = await navigator.storage.getDirectory();
        const dir = await root.getDirectoryHandle("timetable", { create: true });
        const files: string[] = [];
        
        for await (const entry of dir.values()) {
          if (entry.kind === "file" && entry.name.endsWith(".json")) {
            files.push(entry.name);
          }
        }

        files.sort((a, b) => b.localeCompare(a));
        setFileList(files);
      } catch (err: any) {
        console.error("OPFS Scan Error:", err);
        setError("Không thể truy cập hoặc quét thư mục 'timetable' trong hệ thống lưu trữ.");
      }
    }
    loadFileList();
  }, []);

  // 2. Đọc nội dung JSON và bóc tách từ trường 'timetableData'
  useEffect(() => {
    async function fetchTimetableContent() {
      if (!selectedFilename) {
        setTimetable(null);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const root = await navigator.storage.getDirectory();
        const dir = await root.getDirectoryHandle("timetable", { create: false });
        const fileHandle = await dir.getFileHandle(selectedFilename);
        const file = await fileHandle.getFile();
        const text = await file.text();
        
        if (!text.trim()) {
          throw new Error("File rỗng hoặc không có dữ liệu.");
        }

        const rawJson = JSON.parse(text) as OpfsFilePayload;
        
        // Hỗ trợ cả trường hợp file lưu dạng bọc hoặc đối tượng trực tiếp
        if (rawJson.timetableData) {
          setTimetable(rawJson.timetableData);
        } else {
          setTimetable(rawJson as unknown as QuizTimetablePayload);
        }
      } catch (err: any) {
        console.error("OPFS Read Error:", err);
        setError(`Không thể xử lý tệp tin [${selectedFilename}]. Định dạng dữ liệu không thích hợp.`);
        setTimetable(null);
      } finally {
        setLoading(false);
      }
    }
    fetchTimetableContent();
  }, [selectedFilename]);

  const formatDateTime = (dateStr: string) => {
    try {
      const parsedDate = new Date(dateStr);
      if (isNaN(parsedDate.getTime())) return dateStr; 
      return parsedDate.toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div 
      className="flex flex-col gap-6 p-6 min-h-screen w-full bg-[#f8fafc] text-[#1e293b]"
      style={{ fontFamily: "'Nunito', sans-serif" }}
    >
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white border border-[#e2e8f0] rounded-2xl shadow-xs">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#0f172a]">Chiến Lược & Lịch Trình Ôn Tập</h1>
          <p className="text-sm text-[#64748b]">Lịch phân bổ thời gian sửa lỗi sai được thiết kế riêng bởi AI Study Buddy</p>
        </div>
        
        <div className="flex items-center gap-2">
          <label htmlFor="timetable-select" className="text-sm font-semibold text-[#475569] whitespace-nowrap">
            Chọn lịch trình:
          </label>
          <select
            id="timetable-select"
            value={selectedFilename}
            onChange={(e) => setSelectedFilename(e.target.value)}
            className="block w-full sm:w-72 px-3 py-2 bg-white border border-[#cbd5e1] rounded-xl text-sm focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 cursor-pointer transition-all"
          >
            <option value="">-- Chọn lịch trình từ thiết bị --</option>
            {fileList.map((filename) => (
              <option key={filename} value={filename}>
                {filename.replace(".json", "").toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm font-medium">
          ⚠️ {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center p-12 text-[#64748b] text-sm font-medium">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600 mr-2" />
          Đang nạp tiến trình phân bổ thời gian học...
        </div>
      )}

      {/* EMPTY STATE */}
      {!timetable && !loading && !error && (
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-[#cbd5e1] rounded-2xl p-16 bg-white">
          <p className="text-[#334155] font-bold text-base">
            Chưa có kế hoạch hành động nào được chọn.
          </p>
          <p className="text-sm text-[#64748b] mt-1 text-center max-w-md">
            Vui lòng chọn một lịch ôn tập ở hộp menu phía trên để hiển thị chi tiết các bước sửa lỗi.
          </p>
          <div className="mt-6">
            {/* THAY THẾ LINK THÀNH BUTTON PHÁT SỰ KIỆN TOÀN CỤC */}
            <button 
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new Event("open-learning-assistant"));
                }
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all duration-200 shadow-xs active:scale-95 group cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Trò chuyện với Cố vấn để lên lịch</span>
            </button>
          </div>
        </div>
      )}

      {/* MAIN DASHBOARD PANEL */}
      {timetable && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* CỘT TRÁI: THÔNG TIN TỔNG QUAN CHIẾN LƯỢC */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-white border border-[#e2e8f0] p-6 rounded-2xl shadow-xs flex flex-col gap-4">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 mb-1 flex items-center gap-1">
                  <Target className="w-3.5 h-3.5" /> Lộ trình hiện tại
                </div>
                <h2 className="text-lg font-black text-[#0f172a] tracking-tight break-words">
                  {timetable.timetableName.replace(/_/g, ' ').toUpperCase()}
                </h2>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs font-semibold text-slate-500">Bài tập gốc:</p>
                <p className="text-xs font-bold text-slate-800 mt-0.5 break-words">{timetable.quizTitle}</p>
              </div>
              
              <div className="text-[11px] text-[#64748b] pt-1">
                <p>📅 Tạo ngày: <span className="font-semibold text-[#0f172a]">{formatDateTime(timetable.createdAt)}</span></p>
              </div>
            </div>

            <div className="bg-[#0f172a] text-white p-6 rounded-2xl flex-1 shadow-md">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Định hướng cốt lõi từ AI
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-medium bg-slate-800/50 p-4 rounded-xl border border-slate-800/60 whitespace-pre-wrap">
                {timetable.overallStrategySummary}
              </p>
            </div>
          </div>

          {/* CỘT PHẢI: CHI TIẾT TỪNG NGÀY ÔN TẬP */}
          <div className="lg:col-span-2 bg-white border border-[#e2e8f0] p-6 rounded-2xl shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748b] mb-4 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" /> Kế hoạch phân bổ thời gian chi tiết
            </div>
            
            <div className="space-y-4">
              {timetable.schedule?.map((task, index) => (
                <div 
                  key={index} 
                  className="border border-[#e2e8f0] rounded-xl overflow-hidden bg-[#f8fafc] transition-all hover:border-emerald-500/50"
                >
                  {/* Thanh Tiêu Đề Của Ngày */}
                  <div className="bg-white border-b border-[#e2e8f0] px-4 py-3 flex flex-row items-center justify-between gap-2">
                    <span className="px-2.5 py-1 text-xs bg-[#0f172a] text-white font-black rounded-md">
                      {task.day}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-md">
                      <Clock className="w-3.5 h-3.5" /> {task.durationMinutes} phút học ôn
                    </span>
                  </div>
                  
                  {/* Nội dung hành động thực tế */}
                  <div className="p-4 bg-white">
                    <div className="text-[10px] font-extrabold text-[#475569] uppercase tracking-wider block mb-2.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Đầu việc cần hoàn thành hành động
                    </div>
                    <ul className="text-xs text-[#334155] space-y-2 pl-1">
                      {task.actionItems?.map((item, actIdx) => (
                        <li key={actIdx} className="flex gap-2.5 items-start bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                          <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                          <span className="leading-relaxed text-slate-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}