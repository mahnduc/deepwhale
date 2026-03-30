"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { FolderPlus, FolderClosed, RefreshCw, Github, CloudDownload } from "lucide-react";
import CourseCard from "@/components/CourseCard";

interface CourseMeta {
  id: string;
  displayName: string;
  description: string;
  createdAt: number;
}

export default function CourseManager() {
  const [courses, setCourses] = useState<CourseMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const basePath = "/deepwhale";

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
              description: "Dữ liệu cục bộ",
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

  const handleImportTemplate = async () => {
    setUploading(true);
    
    // Cấu hình thông tin Repo 
    const username = "mahnduc";
    const repo = "docsify-template-repo";
    const branch = "main";
    
    // Danh sách các file cốt lõi của một dự án Docsify
    const filesToDownload = [
      "index.html",
      "README.md",
      ".nojekyll",
      "_sidebar.md", 
      // "style.css"    
    ];

    try {
      const courseId = `tpl_${Date.now()}`;
      const root = await navigator.storage.getDirectory();
      const docsify = await root.getDirectoryHandle("docsify", { create: true });
      const coursesDir = await docsify.getDirectoryHandle("courses", { create: true });
      const thisCourseDir = await coursesDir.getDirectoryHandle(courseId, { create: true });

      // Tải từng file một
      for (const fileName of filesToDownload) {
        const rawUrl = `https://raw.githubusercontent.com/${username}/${repo}/${branch}/${fileName}`;
        
        try {
          const response = await fetch(rawUrl);
          if (!response.ok) continue; // Bỏ qua nếu file không tồn tại trong repo

          const content = await response.blob();
          const fileHandle = await thisCourseDir.getFileHandle(fileName, { create: true });
          const writable = await fileHandle.createWritable();
          await writable.write(content);
          await writable.close();
        } catch (fileErr) {
          console.warn(`Bỏ qua file ${fileName} do không tìm thấy hoặc lỗi kết nối.`);
        }
      }

      // Ghi Metadata
      const meta = {
        id: courseId,
        displayName: "Docsify Starter (GitHub Raw)",
        description: `Tải từ: ${username}/${repo}`,
        createdAt: Date.now()
      };
      
      const metaHandle = await thisCourseDir.getFileHandle("metadata.json", { create: true });
      const metaWritable = await metaHandle.createWritable();
      await metaWritable.write(JSON.stringify(meta));
      await metaWritable.close();

      refreshCourses();
      alert("Cài đặt template hoàn tất qua cổng Raw Content!");
    } catch (err) {
      console.error(err);
      alert("Lỗi hệ thống lưu trữ OPFS.");
    } finally {
      setUploading(false);
    }
  };

  const handleFolderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const fileList = Array.from(files);
    
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

      const meta = { id: courseId, displayName: originalName, description: "An toàn, tốc độ", createdAt: Date.now() };
      const metaHandle = await thisCourseDir.getFileHandle("metadata.json", { create: true });
      const metaWritable = await metaHandle.createWritable();
      await metaWritable.write(JSON.stringify(meta));
      await metaWritable.close();

      refreshCourses();
    } catch (err) {
      alert("Lỗi lưu OPFS.");
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
      const meta = { id, displayName: newName, description: newDesc, createdAt: Date.now() };
      const writable = await metaHandle.createWritable();
      await writable.write(JSON.stringify(meta));
      await writable.close();
      refreshCourses();
    } catch (e) {
      alert("Lỗi cập nhật.");
    }
  };

  const deleteCourse = async (id: string, name: string) => {
    if (!confirm(`Xóa vĩnh viễn: ${name}?`)) return;
    try {
      const root = await navigator.storage.getDirectory();
      const docsify = await root.getDirectoryHandle("docsify");
      const coursesDir = await docsify.getDirectoryHandle("courses");
      await coursesDir.removeEntry(id, { recursive: true });
      refreshCourses();
    } catch (e) {
      alert("Lỗi khi xóa.");
    }
  };

  const launchCourse = (id: string) => {
    window.open(`${basePath}/@opfs/docsify/courses/${id}/index.html`, "_blank");
  };

  return (
    <div className="min-h-screen bg-base-200 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-black italic uppercase">Hệ Thống <span className="text-primary">Khóa Học</span></h1>
          <p className="text-[10px] font-bold opacity-40 tracking-widest uppercase mt-2 italic">DeepWhale Core • OPFS Storage</p>
        </header>

        <div className="flex flex-wrap gap-4 mb-12">
          <button onClick={refreshCourses} className={`p-4 rounded-2xl ${neoFlat} ${neoPressed}`}>
            <RefreshCw size={20} className={loading ? "animate-spin text-primary" : "text-primary"} />
          </button>

          <label className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest cursor-pointer ${neoFlat} ${neoPressed} text-primary`}>
            <FolderPlus size={18} />
            {uploading ? "Xử lý..." : "Import Course"}
            <input type="file" ref={fileInputRef} className="hidden" 
            // @ts-ignore
            webkitdirectory="" directory="" onChange={handleFolderUpload} />
          </label>

          <button onClick={handleImportTemplate} disabled={uploading} className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest ${neoFlat} ${neoPressed} text-secondary`}>
            <CloudDownload size={18} />
            {uploading ? "Downloading..." : "GitHub Template"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {loading ? (
            <div className="col-span-full text-center py-20 opacity-50 font-bold uppercase tracking-widest">Đang tải thư viện...</div>
          ) : courses.length === 0 ? (
            <div className={`col-span-full py-32 flex flex-col items-center opacity-40 border-2 border-dashed border-base-content/10 rounded-[3rem]`}>
              <FolderClosed size={64} strokeWidth={1} className="text-primary mb-4" />
              <p className="font-black uppercase italic tracking-widest">Thư viện trống</p>
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