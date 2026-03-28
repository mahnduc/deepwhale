"use client";

import React, { useEffect, useState, useRef } from "react";
import { 
  FilePlus, 
  Upload, // Icon mới cho Upload
  Trash2, 
  FileText, 
  Folder, 
  RefreshCw, 
  Plus, 
  HardDrive 
} from "lucide-react";
import { 
  actionFetchAllFiles, 
  actionSaveFile, 
  actionDeleteEntry, 
  actionAppendToFile,
  actionUploadFile // Import action mới
} from "@/services/fileActions";
import { OPFSEntry } from "@/lib/opfs/types";

export default function OPFSExplorer() {
  const [entries, setEntries] = useState<OPFSEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newFileName, setNewFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref để kích hoạt input file

  const refreshList = async () => {
    setIsLoading(true);
    const data = await actionFetchAllFiles();
    setEntries(data);
    setIsLoading(false);
  };

  useEffect(() => { refreshList(); }, []);

  // --- TÁCH BIỆT 1: TẠO FILE MỚI (Từ tên người dùng nhập) ---
  const handleCreateFile = async () => {
    if (!newFileName) {
      alert("Vui lòng nhập tên file!");
      return;
    }
    try {
      const cleanPath = newFileName.startsWith("/") ? newFileName : `/${newFileName}`;
      await actionSaveFile(cleanPath, "Nội dung tệp mới...");
      setNewFileName("");
      refreshList();
      alert("Đã tạo file trống thành công!");
    } catch (err) { alert("Lỗi: " + err); }
  };

  // --- TÁCH BIỆT 2: ĐẨY FILE TỪ MÁY TÍNH (Upload) ---
  const handleUploadClick = () => {
    fileInputRef.current?.click(); // Kích hoạt sự kiện chọn file
  };

  const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsLoading(true);
    try {
      for (const file of Array.from(files)) {
        // Lưu vào thư mục gốc với tên gốc của file
        const path = `/${file.name}`;
        await actionUploadFile(path, file);
      }
      alert(`Đã upload ${files.length} file thành công!`);
      refreshList();
    } catch (err) {
      alert("Lỗi upload: " + err);
    } finally {
      // Reset input để có thể chọn lại cùng 1 file nếu cần
      if (fileInputRef.current) fileInputRef.current.value = "";
      setIsLoading(false);
    }
  };

  const handleDelete = async (path: string) => {
    if (confirm(`Xóa: ${path}?`)) {
      await actionDeleteEntry(path);
      refreshList();
    }
  };

  const handleAppend = async (path: string) => {
    await actionAppendToFile(path, `\n[Log ${new Date().toLocaleTimeString()}]`);
    alert("Đã thêm log!");
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      {/* Input file ẩn */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        multiple 
        onChange={onFileSelected} 
      />

      {/* Header */}
      <div className="flex items-center justify-between bg-base-200 p-6 rounded-2xl shadow-sm border border-base-300">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary rounded-xl text-primary-content shadow-lg shadow-primary/20">
            <HardDrive size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold">OPFS Manager</h1>
            <p className="text-xs opacity-60 italic">Cloud-like storage in your browser</p>
          </div>
        </div>
        <button onClick={refreshList} className={`btn btn-circle btn-ghost ${isLoading ? 'loading' : ''}`}>
          {!isLoading && <RefreshCw size={20} />}
        </button>
      </div>

      {/* Control Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-base-100 p-4 rounded-xl border border-base-200 shadow-sm">
        {/* Nhóm tạo mới */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Tên file mới..."
            className="input input-bordered w-full"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
          />
          <button onClick={handleCreateFile} className="btn btn-primary gap-2 px-6">
            <FilePlus size={18} />
            Tạo
          </button>
        </div>

        {/* Nhóm Upload */}
        <div className="flex items-center justify-end">
          <div className="divider divider-horizontal hidden md:flex"></div>
          <button 
            onClick={handleUploadClick} 
            className="btn btn-outline btn-secondary w-full md:w-auto gap-2 px-8"
            disabled={isLoading}
          >
            <Upload size={18} />
            Đẩy file từ máy tính
          </button>
        </div>
      </div>

      {/* Danh sách File (Giữ nguyên phần Table của bạn) */}
      <div className="bg-base-100 border border-base-300 rounded-2xl overflow-hidden shadow-sm">
        <table className="table w-full">
          <thead>
            <tr className="bg-base-200 text-sm uppercase opacity-70">
              <th>Tên tệp</th>
              <th>Loại</th>
              <th>Đường dẫn</th>
              <th className="text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 && !isLoading && (
              <tr>
                <td colSpan={4} className="text-center py-16 opacity-40 italic">
                  Chưa có dữ liệu trong kho lưu trữ OPFS.
                </td>
              </tr>
            )}
            {entries.map((entry) => (
              <tr key={entry.path} className="hover:bg-base-200/40 transition-colors group">
                <td>
                  <div className="flex items-center gap-3">
                    {entry.kind === "directory" ? <Folder size={18} className="text-warning" /> : <FileText size={18} className="text-info" />}
                    <span className="font-medium group-hover:text-primary transition-colors">{entry.name}</span>
                  </div>
                </td>
                <td><span className="badge badge-sm badge-outline opacity-70 italic">{entry.kind}</span></td>
                <td className="text-xs font-mono opacity-50 truncate max-w-[150px]">/{entry.path}</td>
                <td>
                  <div className="flex justify-end gap-1">
                    {entry.kind === "file" && (
                      <button onClick={() => handleAppend(entry.path)} className="btn btn-square btn-ghost btn-xs text-success" title="Thêm log">
                        <Plus size={14} />
                      </button>
                    )}
                    <button onClick={() => handleDelete(entry.path)} className="btn btn-square btn-ghost btn-xs text-error" title="Xóa">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}