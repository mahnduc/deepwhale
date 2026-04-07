"use client";

import { useRouter } from "next/navigation";
import { ChevronRight, Plus, Activity } from "lucide-react";
import { TOOLS_LIST } from "./tools.constants";

export default function Tools() {
  const router = useRouter();

  return (
    <div className="w-full min-h-full bg-[var(--color-ui-bg)]">
      {/* Container căn giữa theo phong cách Web-Base Application */}
      <div className="max-w-5xl mx-auto py-12 px-6 lg:px-12">
        
        {/* HEADER SECTION - Tối giản theo Typography Guide */}
        <header className="mb-12">
          <div className="flex items-center gap-2 mb-3">
            <Activity size={14} className="text-[var(--color-brand-primary)]" />
            <h6>Protocol Extensions</h6>
          </div>
          <h1 className="!mt-0">Hệ thống Công cụ</h1>
          <p className="text-[var(--color-ui-text-muted)] max-w-2xl">
            Mở rộng năng lực xử lý và tích hợp hệ thống cho thực thể DeepWhale thông qua các module chuyên biệt.
          </p>
        </header>

        {/* GRID SYSTEM - Sử dụng ui-card-interactive */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
          {TOOLS_LIST.map((tool) => (
            <div
              key={tool.id}
              onClick={() => router.push(`/tools/${tool.path}`)}
              className="ui-card-interactive group flex flex-col min-h-[200px]"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-5">
                <div className="p-2.5 rounded-lg bg-[var(--color-ui-bg)] border border-[var(--color-ui-border)] text-[var(--color-icon-muted)] group-hover:text-[var(--color-brand-primary)] group-hover:border-[var(--color-brand-primary)]/30 transition-all">
                  {tool.icon}
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-1.5 bg-[var(--color-state-success)]/10 px-2.5 py-1 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-state-success)] animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-state-success)]">
                    Ready
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="flex-1">
                <h3 className="!mt-0 group-hover:text-[var(--color-brand-primary)] transition-colors">
                  {tool.name}
                </h3>
                <p className="text-[var(--color-ui-text-muted)] line-clamp-2 mb-6">
                  {tool.description}
                </p>
              </div>

              {/* Card Footer */}
              <div className="pt-4 border-t border-[var(--color-ui-border)] flex items-center justify-between mt-auto">
                <div className="flex items-center gap-2 font-mono text-[10px] text-[var(--color-ui-text-subtle)] uppercase tracking-tight">
                  <span className="px-1.5 py-0.5 rounded bg-[var(--color-ui-border)]/30">{tool.path}</span>
                  <span className="opacity-30">/</span>
                  <span>Logic_Module</span>
                </div>
                <ChevronRight size={16} className="text-[var(--color-icon-muted)] group-hover:translate-x-1 group-hover:text-[var(--color-brand-primary)] transition-all" />
              </div>
            </div>
          ))}

          {/* Pending Slot - Sử dụng ui-card-outline */}
          <div className="ui-card-outline flex flex-col items-center justify-center p-10 opacity-50 hover:opacity-100 transition-all cursor-help group min-h-[220px]">
            <div className="w-12 h-12 rounded-xl border border-dashed border-[var(--color-ui-border)] flex items-center justify-center mb-4 bg-[var(--color-ui-card)]/50">
              <Plus size={20} className="text-[var(--color-icon-muted)] group-hover:rotate-90 transition-transform duration-500" />
            </div>
            <h6 className="italic normal-case tracking-normal text-[var(--color-ui-text-subtle)]">Integration Pending...</h6>
          </div>
        </div>
      </div>
    </div>
  );
}