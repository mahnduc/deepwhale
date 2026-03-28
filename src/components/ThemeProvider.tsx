"use client"; // Bắt buộc phải có dòng này

import { useEffect } from "react";

export default function ThemeProvider() {
  useEffect(() => {
    // Đoạn code này chỉ chạy trên trình duyệt người dùng
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  return null; // Component này không cần hiển thị gì cả
}