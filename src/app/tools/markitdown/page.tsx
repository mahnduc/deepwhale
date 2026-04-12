"use client";

import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";

export default function MarkitdownTool() {
  const [file, setFile] = useState<File | null>(null);
  const [isPdf, setIsPdf] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [statusType, setStatusType] = useState<"info" | "success" | "error">("info");

  const [totalPages, setTotalPages] = useState(0);
  const [fromPage, setFromPage] = useState(1);
  const [toPage, setToPage] = useState(1);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  // HANDLE FILE SELECT
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > MAX_FILE_SIZE) {
      alert("File quá lớn! Vui lòng chọn file dưới 10MB.");
      return;
    }

    setFile(selectedFile);
    setMessage(`Đã chọn: ${selectedFile.name}`);
    setStatusType("info");

    const isPdfFile = selectedFile.type === "application/pdf" || selectedFile.name.toLowerCase().endsWith(".pdf");
    setIsPdf(isPdfFile);

    if (isPdfFile) {
      try {
        const bytes = await selectedFile.arrayBuffer();
        const pdf = await PDFDocument.load(bytes);
        const count = pdf.getPageCount();
        setTotalPages(count);
        setFromPage(1);
        setToPage(count);
      } catch {
        setMessage("Lỗi đọc PDF.");
        setStatusType("error");
      }
    }
  };

  // CÁCH TIẾP CẬN MỚI: FIX LỖI TYPE
  const splitPdfByRange = async (originalFile: File, start: number, end: number): Promise<File> => {
    const bytes = await originalFile.arrayBuffer();
    const pdf = await PDFDocument.load(bytes);
    const newPdf = await PDFDocument.create();

    const pageIndexes = Array.from({ length: end - start + 1 }, (_, i) => start - 1 + i);
    const pages = await newPdf.copyPages(pdf, pageIndexes);
    pages.forEach((p) => newPdf.addPage(p));

    const pdfBytes = await newPdf.save();

    const cleanBytes = new Uint8Array(pdfBytes);

    return new File([cleanBytes], originalFile.name, { type: "application/pdf" });
  };

  // HANDLE UPLOAD & DOWNLOAD
  const handleUpload = async () => {
    if (!file) return;
    setIsLoading(true);
    setMessage("Đang xử lý text & bảng biểu...");
    setStatusType("info");

    try {
      let fileToUpload = file;
      if (isPdf && (fromPage !== 1 || toPage !== totalPages)) {
        fileToUpload = await splitPdfByRange(file, fromPage, toPage);
      }

      const formData = new FormData();
      formData.append("file", fileToUpload);

      const response = await fetch("http://localhost:8000/convert", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Chuyển đổi thất bại.");

      const blob = await response.blob();
      const fileName = fileToUpload.name.replace(/\.[^/.]+$/, "") + ".md";

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);

      setMessage("Tải file .md thành công!");
      setStatusType("success");
    } catch (err: any) {
      setMessage(`Lỗi: ${err.message}`);
      setStatusType("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
        
        {/* Header UI */}
        <div className="bg-indigo-600 p-8 text-white text-center">
          <h1 className="text-2xl font-black uppercase tracking-widest">MarkItDown v2</h1>
          <p className="text-indigo-100 text-xs mt-1">Chỉ xử lý Text & Tables (Xuất .md)</p>
        </div>

        <div className="p-8 space-y-6">
          {/* File Selector */}
          <div className="group relative border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center hover:bg-slate-50 transition-all">
            <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
            <div className="text-4xl mb-2">{file ? "📄" : "📤"}</div>
            <p className="text-sm font-bold text-slate-600">{file ? file.name : "Chọn tài liệu"}</p>
          </div>

          {/* PDF Range UI */}
          {isPdf && file && (
            <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-500">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <label className="text-[10px] font-black text-slate-400 block mb-1">TRANG BẮT ĐẦU</label>
                <input 
                  type="number" value={fromPage} 
                  onChange={(e) => setFromPage(Number(e.target.value))}
                  className="w-full bg-transparent font-bold text-indigo-600 outline-none"
                />
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <label className="text-[10px] font-black text-slate-400 block mb-1">TRANG KẾT THÚC</label>
                <input 
                  type="number" value={toPage} 
                  onChange={(e) => setToPage(Number(e.target.value))}
                  className="w-full bg-transparent font-bold text-indigo-600 outline-none"
                />
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleUpload}
            disabled={!file || isLoading}
            className={`w-full py-4 rounded-2xl font-black text-white transition-all shadow-lg ${
              isLoading ? "bg-slate-300" : "bg-indigo-600 hover:bg-indigo-700 active:scale-95"
            }`}
          >
            {isLoading ? "ĐANG XỬ LÝ..." : "XUẤT MARKDOWN (.MD)"}
          </button>

          {/* Success/Error Message */}
          {message && (
            <div className={`text-center text-xs font-bold p-3 rounded-xl ${
              statusType === "success" ? "text-emerald-600 bg-emerald-50" : 
              statusType === "error" ? "text-rose-600 bg-rose-50" : "text-slate-500 bg-slate-50"
            }`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}