"use client";

import React from "react";
import { UploadCloud, PenLine, FileText, ChevronRight } from "lucide-react";
import Link from "next/link";

export const Step1 = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="w-full max-w-3xl">
        {/* Tiêu đề giai đoạn */}
        <div className="mb-8 text-center lg:text-left">
          <h6 className="mb-2">Giai đoạn 01</h6>
          <h1>Chuẩn hóa tài liệu</h1>
        </div>

        {/* Khu vực lựa chọn phương thức */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Option 1: Tải tệp lên */}
          <div className="ui-card-interactive group flex flex-col items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-ui-bg)] border border-[var(--color-ui-border)] flex items-center justify-center text-[var(--color-icon-brand)] transition-colors group-hover:bg-white">
              <UploadCloud size={20} />
            </div>
            <div className="flex-1">
              <h3>Tải tệp tài liệu</h3>
              <p className="text-[var(--color-ui-text-muted)]">
                Hỗ trợ PDF, DOCX, TXT. Tự động chuyển đổi sang định dạng Markdown chuẩn.
              </p>
            </div>
            <div className="w-full pt-4 flex items-center justify-between text-[var(--color-brand-primary)] font-bold text-[12px] uppercase tracking-wider">
              <span>Bắt đầu tải lên</span>
              <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          {/* Option 2: Tạo tài liệu mới */}
          <div className="ui-card-interactive group flex flex-col items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-ui-bg)] border border-[var(--color-ui-border)] flex items-center justify-center text-[var(--color-icon-brand)] transition-colors group-hover:bg-white">
              <PenLine size={20} />
            </div>
            <div className="flex-1">
              <h3>Soạn thảo trực tiếp</h3>
              <p className="text-[var(--color-ui-text-muted)]">
                Tạo nội dung mới bằng trình soạn thảo Markdown tích hợp sẵn.
              </p>
            </div>
            <div className="w-full pt-4 flex items-center justify-between text-[var(--color-brand-primary)] font-bold text-[12px] uppercase tracking-wider">
              <Link href="/editor">
              <span>Mở trình soạn thảo</span>
              <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};