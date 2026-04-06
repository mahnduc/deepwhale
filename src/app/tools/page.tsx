"use client";

import { useRouter } from "next/navigation";
import { ChevronRight, Plus, Activity } from "lucide-react";
import { TOOLS_LIST } from "./tools.constants";

export default function Tools() {
  const router = useRouter();

  return (
    <div className="flex-1 bg-ui-bg text-ui-text-main antialiased selection:bg-brand-primary/10 min-h-screen">
      {/* Layout Full Width nhưng giới hạn nội dung trung tâm để đọc tốt hơn */}
      <div className="max-w-4xl mx-auto py-16 px-6 lg:px-10">
        
        {/* HEADER - Tuân thủ Grayscale Typography */}
        <header className="mb-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 bg-brand-primary rounded-full"></div>
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-ui-text-muted">
              Protocol Extensions
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-4 text-ui-text-main">
            Hệ thống Công cụ
          </h1>
          <p className="text-base text-ui-text-muted leading-relaxed max-w-xl">
            Mở rộng năng lực xử lý và tích hợp hệ thống cho thực thể DeepWhale thông qua các module chuyên biệt.
          </p>
        </header>
        
        {/* GRID SYSTEM - Card UI phong cách Flat */}
        <div className="flex flex-col space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TOOLS_LIST.map((tool) => (
              <div 
                key={tool.id} 
                onClick={() => router.push(`/tools/${tool.path}`)}
                className="group bg-ui-card rounded-2xl p-6 transition-all duration-200 cursor-pointer border border-transparent hover:border-ui-border hover:bg-ui-border/10 flex flex-col h-full"
              >
                <div className="flex items-start justify-between mb-6">
                  {/* Icon - Minimalist */}
                  <div className="w-12 h-12 flex items-center justify-center text-ui-text-muted group-hover:text-brand-primary transition-colors">
                    {tool.icon}
                  </div>
                  
                  <div className="flex items-center gap-1.5 bg-state-success/5 px-2 py-1 rounded-full">
                    <div className="w-1 h-1 rounded-full bg-state-success"></div>
                    <span className="text-[9px] font-bold uppercase tracking-tight text-state-success">
                      Online
                    </span>
                  </div>
                </div>

                <div className="flex-1">
                  <h2 className="text-lg font-semibold tracking-tight mb-2 text-ui-text-main group-hover:text-brand-primary transition-colors">
                    {tool.name}
                  </h2>
                  <p className="text-sm text-ui-text-muted leading-relaxed line-clamp-2 mb-6 font-normal">
                    {tool.description}
                  </p>
                </div>
                
                {/* Metadata - Mono font & Action */}
                <div className="pt-4 border-t border-ui-border/20 flex items-center justify-between mt-auto">
                  <div className="flex gap-3 text-[9px] font-medium font-mono text-ui-text-muted/40 uppercase">
                    <span>{tool.path}</span>
                    <span>•</span>
                    <span>Logic_Module</span>
                  </div>
                  <ChevronRight size={14} className="text-ui-text-muted group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))}

            {/* Upcoming Module - Border dashed rounded-2xl */}
            <div className="flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-ui-border opacity-40 hover:opacity-100 transition-opacity cursor-help group min-h-[200px]">
              <div className="w-10 h-10 rounded-xl border border-dashed border-ui-text-muted flex items-center justify-center mb-4">
                <Plus size={16} className="text-ui-text-muted group-hover:rotate-90 transition-transform duration-300" />
              </div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-ui-text-muted italic">
                Integration Pending...
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}