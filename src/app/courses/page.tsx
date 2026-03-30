"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { FolderPlus, FolderClosed, RefreshCw, Github, CloudDownload } from "lucide-react";
import CourseCard from "@/components/CourseCard";
import JSZip from "jszip";

interface CourseMeta {
  id: string;         // ID vật lý (tên folder trong OPFS)
  displayName: string;  // Tên hiển thị người dùng đặt
  description: string;  // Mô tả khóa học
  createdAt: number;
}

export default function CourseManager() {
  const [courses, setCourses] = useState<CourseMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const basePath = "/deepwhale";
  const repoZipUrl = "https://github.com/mahnduc/docsify-template-repo/archive/refs/heads/main.zip";

  const neoFlat = "shadow-[5px_5px_10px_rgba(0,0,0,0.1),-5px_-5px_10px_rgba(255,255,255,0.5)]";
  const neoPressed = "active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),inset_-2px_-2px_5px_rgba(255,255,255,0.5)]";

  useEffect(() => {
    refreshCourses();
  }, []);

  const refreshCourses = useCallback(async () => {
    setLoading(true);
    try {
      const root = await navigator.storage.getDirectory();
      const docsify = await root.getDirectoryHandle("docsify", { create: true });
      const coursesDir = await docsify.getDirectoryHandle("courses", { create: true });

      const list: CourseMeta[] = [];
      // @ts-ignore
      for await (const entry of coursesDir.values()) {
        if (entry.kind === "directory") {
          try {
            const subDir = await coursesDir.getDirectoryHandle(entry.name);
            const metaFile = await subDir.getFileHandle("metadata.json");
            const file = await metaFile.getFile();
            const meta = JSON.parse(await file.text());
            list.push(meta);
          } catch (e) {
            list.push({ 
              id: entry.name, 
              displayName: entry.name, 
              description: "An toàn, tốc độ",
              createdAt: Date.now() 
            });
          }
        }
      }
      setCourses(list.sort((a, b) => b.createdAt - a.createdAt));
    } catch (err) {
      console.error("Lỗi tải danh sách:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // HÀM MỚI: Tải Template từ GitHub của bạn
  const handleImportTemplate = async () => {
    setUploading(true);
    try {
      // 1. Fetch file ZIP từ GitHub
      const response = await fetch(repoZipUrl);
      if (!response.ok) throw new Error("Không thể kết nối GitHub");
      const arrayBuffer = await response.arrayBuffer();

      // 2. Giải nén
      const zip = await JSZip.loadAsync(arrayBuffer);
      const courseId = `tpl_${Date.now()}`;
      
      const root = await navigator.storage.getDirectory();
      const docsify = await root.getDirectoryHandle("docsify", { create: true });
      const coursesDir = await docsify.getDirectoryHandle("courses", { create: true });
      const thisCourseDir = await coursesDir.getDirectoryHandle(courseId, { create: true });

      // GitHub ZIP luôn lồng trong folder "[repo-name]-[branch]"
      const entries = Object.keys(zip.files);
      const rootFolderInZip = entries[0].split('/')[0];

      // 3. Ghi vào OPFS
      for (const [relativePath, file] of Object.entries(zip.files)) {
        if (file.dir) continue;

        // Bỏ folder gốc của GitHub để lấy nội dung bên trong
        const cleanPath = relativePath.replace(`${rootFolderInZip}/`, "");
        if (!cleanPath) continue;

        const pathParts = cleanPath.split("/");
        const fileName = pathParts.pop()!;
        
        let currentDirHandle = thisCourseDir;
        for (const part of pathParts) {
          currentDirHandle = await currentDirHandle.getDirectoryHandle(part, { create: true });
        }

        const fileBlob = await file.async("blob");
        const fileHandle = await currentDirHandle.getFileHandle(fileName, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(fileBlob);
        await writable.close();
      }

      // 4. Metadata cho Template
      const meta: CourseMeta = {
        id: courseId,
        displayName: "Docsify Starter (mahnduc)",
        description: "Template mặc định từ GitHub Repo",
        createdAt: Date.now()
      };
      const metaHandle = await thisCourseDir.getFileHandle("metadata.json", { create: true });
      const metaWritable = await metaHandle.createWritable();
      await metaWritable.write(JSON.stringify(meta));
      await metaWritable.close();

      refreshCourses();
      alert("Cài đặt Template từ GitHub thành công!");
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tải mẫu từ GitHub. Kiểm tra kết nối mạng.");
    } finally {
      setUploading(false);
    }
  };

  const handleFolderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    const hasIndex = fileList.some(f => f.webkitRelativePath.split('/').length === 2 && f.name === 'index.html');
    
    if (!hasIndex) {
      alert("Folder không hợp lệ (Thiếu index.html ở thư mục gốc)");
      return;
    }

    setUploading(true);
    const courseId = `course_${Date.now()}`;
    const originalName = fileList[0].webkitRelativePath.split('/')[0];

    try {
      const root = await navigator.storage.getDirectory();
      const docsify = await root.getDirectoryHandle("docsify", { create: true });
      const coursesDir = await docsify.getDirectoryHandle("courses", { create: true });
      const thisCourseDir = await coursesDir.getDirectoryHandle(courseId, { create: true });

      for (const file of fileList) {
        const parts = file.webkitRelativePath.split("/");
        let current = thisCourseDir;
        for (let i = 1; i < parts.length - 1; i++) {
          current = await current.getDirectoryHandle(parts[i], { create: true });
        }
        const fileHandle = await current.getFileHandle(parts[parts.length - 1], { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(file);
        await writable.close();
      }

      const meta: CourseMeta = { 
        id: courseId, 
        displayName: originalName, 
        description: "An toàn, tốc độ",
        createdAt: Date.now() 
      };
      const metaHandle = await thisCourseDir.getFileHandle("metadata.json", { create: true });
      const metaWritable = await metaHandle.createWritable();
      await metaWritable.write(JSON.stringify(meta));
      await metaWritable.close();

      refreshCourses();
    } catch (err) {
      alert("Lỗi trong quá trình lưu vào OPFS.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleUpdateMetadata = async (id: string, newName: string, newDesc: string) => {
    try {
      const root = await navigator.storage.getDirectory();
      const docsify = await root.getDirectoryHandle("docsify");
      const coursesDir = await docsify.getDirectoryHandle("courses");
      const subDir = await coursesDir.getDirectoryHandle(id);
      
      const metaHandle = await subDir.getFileHandle("metadata.json", { create: true });
      const meta: CourseMeta = { 
        id, 
        displayName: newName, 
        description: newDesc, 
        createdAt: courses.find(c => c.id === id)?.createdAt || Date.now() 
      };
      
      const writable = await metaHandle.createWritable();
      await writable.write(JSON.stringify(meta));
      await writable.close();

      setCourses(prev => prev.map(c => c.id === id ? meta : c));
    } catch (e) {
      alert("Không thể cập nhật metadata.");
    }
  };

  const deleteCourse = async (id: string, name: string) => {
    if (!confirm(`Xóa vĩnh viễn khóa học: ${name}?`)) return;
    try {
      const root = await navigator.storage.getDirectory();
      const docsify = await root.getDirectoryHandle("docsify");
      const coursesDir = await docsify.getDirectoryHandle("courses");
      await coursesDir.removeEntry(id, { recursive: true });
      refreshCourses();
    } catch (e) {
      alert("Lỗi khi xóa dữ liệu.");
    }
  };

  const launchCourse = (id: string) => {
    const virtualURL = `${basePath}/@opfs/docsify/courses/${id}/index.html`;
    window.open(virtualURL, "_blank");
  };

  return (
    <div className="min-h-screen bg-base-200 p-8 text-base-content transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">
            Hệ Thống <span className="text-primary">Khóa Học</span>
          </h1>
          <p className="text-[10px] font-bold opacity-40 uppercase tracking-[0.3em] mt-2 italic">
            ID-Based Meta System • DeepWhale Core
          </p>
        </header>

        <div className="flex flex-wrap gap-4 mb-12">
          <button 
            onClick={refreshCourses} 
            className={`p-4 rounded-2xl bg-base-200 transition-all ${loading ? "animate-spin opacity-50" : neoFlat + " " + neoPressed}`}
          >
            <RefreshCw size={20} className="text-primary" />
          </button>
          
          <label className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest cursor-pointer transition-all ${uploading ? "opacity-50 cursor-not-allowed" : "text-primary " + neoFlat + " " + neoPressed}`}>
            <FolderPlus size={18} />
            {uploading ? "Đang xử lý..." : "Import Course"}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              // @ts-ignore
              webkitdirectory="" 
              directory="" 
              onChange={handleFolderUpload} 
            />
          </label>

          {/* NÚT MỚI: Tải Template từ Github của bạn */}
          <button 
            onClick={handleImportTemplate}
            disabled={uploading}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all text-secondary ${uploading ? "opacity-50" : neoFlat + " " + neoPressed}`}
          >
            <CloudDownload size={18} />
            {uploading ? "Downloading..." : "GitHub Template"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className={`h-64 rounded-[2.5rem] bg-base-200 animate-pulse ${neoFlat}`} />
            ))
          ) : courses.length === 0 ? (
            <div className={`col-span-full py-32 flex flex-col items-center justify-center rounded-[3rem] bg-base-200 border-2 border-dashed border-base-content/5 opacity-40 ${neoFlat}`}>
              <div className={`p-8 rounded-full mb-6 ${neoPressed}`}>
                <FolderClosed size={64} strokeWidth={1} className="text-primary" />
              </div>
              <h3 className="text-lg font-black uppercase italic tracking-widest">Thư viện trống</h3>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] mt-2">Sử dụng GitHub Template hoặc Import để bắt đầu</p>
            </div>
          ) : (
            courses.map((course) => (
              <CourseCard
                key={course.id}
                id={course.id}
                name={course.displayName}
                description={course.description}
                uploadDate={new Date(course.createdAt).toLocaleDateString('vi-VN')}
                onLaunch={() => launchCourse(course.id)}
                onDelete={() => deleteCourse(course.id, course.displayName)}
                onUpdateMetadata={(newName, newDesc) => handleUpdateMetadata(course.id, newName, newDesc)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}