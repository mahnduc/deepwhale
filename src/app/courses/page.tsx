"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { FolderPlus, FolderClosed, RefreshCw, CloudDownload } from "lucide-react";
import CourseCard from "@/components/CourseCard";

import {
  getCourses,
  importTemplate,
  uploadCourseFolder,
  updateCourseMeta,
  deleteCourseById,
  CourseMeta
} from "./course.service";

export default function CourseManager() {
  const [courses, setCourses] = useState<CourseMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const basePath = "/deepwhale";

  const neoFlat =
    "shadow-[5px_5px_10px_rgba(0,0,0,0.1),-5px_-5px_10px_rgba(255,255,255,0.5)]";
  const neoPressed =
    "active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),inset_-2px_-2px_5px_rgba(255,255,255,0.5)]";

  useEffect(() => {
    refreshCourses();
  }, []);

  // Load danh sách
  const refreshCourses = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getCourses();
      setCourses(list);
    } catch (err) {
      console.error("Lỗi tải danh sách:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Import template GitHub
  const handleImportTemplate = async () => {
    setUploading(true);
    try {
      await importTemplate();
      await refreshCourses();
      alert("Cài đặt template hoàn tất!");
    } catch (err) {
      console.error(err);
      alert("Lỗi tải template.");
    } finally {
      setUploading(false);
    }
  };

  // Upload folder
  const handleFolderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      await uploadCourseFolder(files);
      await refreshCourses();
    } catch (err) {
      console.error(err);
      alert("Lỗi upload.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Update metadata
  const handleUpdateMetadata = async (id: string, newName: string, newDesc: string) => {
    try {
      await updateCourseMeta(id, newName, newDesc);
      await refreshCourses();
    } catch (e) {
      alert("Lỗi cập nhật.");
    }
  };

  // Delete
  const handleDeleteCourse = async (id: string, name: string) => {
    if (!confirm(`Xóa vĩnh viễn: ${name}?`)) return;

    try {
      await deleteCourseById(id);
      await refreshCourses();
    } catch (e) {
      alert("Lỗi khi xóa.");
    }
  };

  // Launch course
  const launchCourse = (id: string) => {
    // Đảm bảo basePath không bị lặp dấu //
    const cleanBasePath = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
    const url = `${cleanBasePath}/@opfs/docsify/courses/${id}/index.html`;

    console.log("Opening course at:", url); // Kiểm tra log này trên Production
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-base-200 p-8">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <header className="mb-12">
          <h1 className="text-4xl font-black italic uppercase">
            Hệ Thống <span className="text-primary">Khóa Học</span>
          </h1>
          <p className="text-[10px] font-bold opacity-40 tracking-widest uppercase mt-2 italic">
            DeepWhale Core • OPFS Storage
          </p>
        </header>

        {/* ACTIONS */}
        <div className="flex flex-wrap gap-4 mb-12">
          {/* Refresh */}
          <button
            onClick={refreshCourses}
            className={`p-4 rounded-2xl ${neoFlat} ${neoPressed}`}
          >
            <RefreshCw
              size={20}
              className={loading ? "animate-spin text-primary" : "text-primary"}
            />
          </button>

          {/* Upload folder */}
          <label
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest cursor-pointer ${neoFlat} ${neoPressed} text-primary`}
          >
            <FolderPlus size={18} />
            {uploading ? "Xử lý..." : "Import Course"}
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

          {/* GitHub template */}
          <button
            onClick={handleImportTemplate}
            disabled={uploading}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest ${neoFlat} ${neoPressed} text-secondary`}
          >
            <CloudDownload size={18} />
            {uploading ? "Downloading..." : "GitHub Template"}
          </button>
        </div>

        {/* COURSE GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {loading ? (
            <div className="col-span-full text-center py-20 opacity-50 font-bold uppercase tracking-widest">
              Đang tải thư viện...
            </div>
          ) : courses.length === 0 ? (
            <div className="col-span-full py-32 flex flex-col items-center opacity-40 border-2 border-dashed border-base-content/10 rounded-[3rem]">
              <FolderClosed size={64} strokeWidth={1} className="text-primary mb-4" />
              <p className="font-black uppercase italic tracking-widest">
                Thư viện trống
              </p>
            </div>
          ) : (
            courses.map((course) => (
              <CourseCard
                key={course.id}
                id={course.id}
                name={course.displayName}
                description={course.description}
                uploadDate={new Date(course.createdAt).toLocaleDateString("vi-VN")}
                onLaunch={() => launchCourse(course.id)}
                onDelete={() => handleDeleteCourse(course.id, course.displayName)}
                onUpdateMetadata={(newName, newDesc) =>
                  handleUpdateMetadata(course.id, newName, newDesc)
                }
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}