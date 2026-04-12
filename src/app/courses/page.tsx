"use client";

import React from "react";
import { 
  ArrowRight, 
  FileText, 
  Users, 
  Search, 
  Filter, 
  Plus, 
  History, 
  User, 
  Cpu, 
  Globe, 
  Layout, 
  MoreVertical 
} from "lucide-react";
import Link from "next/link";

const INTERNAL_DOCS = [
  {
    id: 1,
    title: "Tiêu chuẩn Kiến trúc MCP cho DeepWhale AI",
    category: "Technical",
    lastUpdated: "10/04/2026",
    owner: "Vương Mạnh Đức",
    classification: "Confidential",
    version: "v2.4.0",
    icon: <Cpu size={18} />,
  },
  {
    id: 2,
    title: "Quy trình Triển khai Local-first với OPFS",
    category: "Engine",
    lastUpdated: "02/04/2026",
    owner: "Lead Architect",
    classification: "Internal",
    version: "v1.1.2",
    icon: <Globe size={18} />,
  },
  {
    id: 3,
    title: "Design System & UI Component Library v4",
    category: "Frontend",
    lastUpdated: "12/04/2026",
    owner: "Vương Mạnh Đức",
    classification: "Internal",
    version: "v4.0.1",
    icon: <Layout size={18} />,
  },
];

export default function Course() {
  return (
    <div className="flex flex-col h-full w-full max-w-[1400px] mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      
      {/* Search & Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-80 group">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-icon-muted)]" />
            <input 
              type="text" 
              placeholder="Tìm tài liệu..."
              className="w-full bg-[var(--color-ui-card)] border border-[var(--color-ui-border)] rounded-md pl-9 pr-4 py-2 text-sm outline-none focus:border-[var(--color-brand-primary)] transition-all"
            />
          </div>
          <button className="p-2 bg-[var(--color-ui-card)] border border-[var(--color-ui-border)] rounded-md text-[var(--color-ui-text-muted)] hover:bg-[#fcfcfc] transition-colors">
            <Filter size={16} />
          </button>
        </div>
        <Link href="/courses/create">
        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-[var(--color-brand-primary)] text-white text-sm font-medium rounded-md hover:opacity-90 active:scale-95 transition-all w-full sm:w-auto">
          <Plus size={16} />
          <span>Tạo mới</span>
        </button>
        </Link>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {INTERNAL_DOCS.map((doc) => (
          <div key={doc.id} className="ui-card-interactive flex flex-col group h-full">
            {/* Top Info */}
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2 rounded-md border border-[var(--color-ui-border)] bg-[var(--color-ui-bg)] text-[var(--color-brand-primary)]`}>
                {doc.icon}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border border-[var(--color-ui-border)] text-[var(--color-ui-text-muted)] bg-[var(--color-ui-bg)]">
                  {doc.version}
                </span>
                <button className="text-[var(--color-ui-text-subtle)] hover:text-[var(--color-ui-text-main)]">
                  <MoreVertical size={14} />
                </button>
              </div>
            </div>

            {/* Title & Category */}
            <div className="flex-1">
              <h6>{doc.category}</h6>
              <h3 className="line-clamp-2 leading-tight group-hover:text-[var(--color-brand-primary)] transition-colors">
                {doc.title}
              </h3>
            </div>

            {/* Classification & Metadata */}
            <div className="mt-4 pt-3 border-t border-[var(--color-ui-border)] space-y-3">
              <div className="flex items-center justify-between text-[11px]">
                <div className={`flex items-center gap-1 font-bold uppercase tracking-tighter ${
                  doc.classification === 'Confidential' ? 'text-[var(--color-state-error)]' : 'text-[var(--color-state-success)]'
                }`}>
                  <FileText size={12} />
                  {doc.classification}
                </div>
                <div className="flex items-center gap-1 text-[var(--color-ui-text-subtle)]">
                  <History size={12} />
                  {doc.lastUpdated}
                </div>
              </div>

              <div className="flex items-center justify-between group/btn">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-5 h-5 rounded-full bg-[var(--color-brand-primary)]/10 flex items-center justify-center shrink-0">
                    <User size={10} className="text-[var(--color-brand-primary)]" />
                  </div>
                  <span className="text-xs truncate font-medium text-[var(--color-ui-text-muted)]">
                    {doc.owner}
                  </span>
                </div>
                <div className="text-[var(--color-brand-primary)] opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-200">
                  <ArrowRight size={16} />
                </div>
              </div>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}