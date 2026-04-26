"use client";

import React, { useState } from "react";
import { 
  Search, 
  Filter, 
  Plus, 
  User, 
  Clock, 
  Tag as TagIcon,
  MoreHorizontal
} from "lucide-react";
import Link from "next/link";

export default function Course() {
  const [searchTerm, setSearchTerm] = useState("");

  const courses = [
    { id: "DOC-001", title: "Advanced Neural Architectures", creator: "Admin_Dev", time: "2026-04-25", tags: ["AI", "Research"] },
    { id: "DOC-002", title: "Quantum Computing Logic", creator: "Quantum_Lab", time: "2026-04-20", tags: ["Physics", "Computing"] },
    { id: "DOC-003", title: "Rust Memory Management", creator: "Systems_Arch", time: "2026-04-18", tags: ["Systems", "Rust"] }
  ];

  const filteredCourses = courses.filter((course) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      course.title.toLowerCase().includes(searchLower) ||
      course.creator.toLowerCase().includes(searchLower) ||
      course.id.toLowerCase().includes(searchLower) ||
      course.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  });

  return (
    // 1. Giảm pt-6 xuống pt-2 (hoặc pt-0 nếu top bar đã có padding) để sát mép trên
    <div className="flex flex-col h-full w-full max-w-[1440px] mx-auto px-6 lg:px-8 pt-2 pb-8 space-y-6 bg-[#000000] font-mono">

      {/* Search & Action Bar */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 bg-[#000000] py-4 rounded-[4px] flex flex-col sm:flex-row items-center justify-between gap-6 transition-all duration-300">
          <div className="flex items-center gap-4 w-full sm:w-auto flex-1">
            <div className="relative w-full max-w-xl">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#717B7A]" />
              <input 
                type="text" 
                placeholder="FIND_BY_KEYWORD..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#000000] border border-[#262626] rounded-[2px] pl-10 pr-4 py-3 text-xs text-[#DCE4E5] outline-none focus:border-[#00E5FF] placeholder:text-[#262626] uppercase"
              />
            </div>
            <button className="p-3 border border-[#262626] text-[#717B7A] hover:border-[#00E5FF] hover:text-[#00E5FF] transition-all">
              <Filter size={16} />
            </button>
          </div>

          <Link href="/dashboard/courses/create" className="w-full sm:w-auto">
            <button className="flex items-center justify-center gap-3 px-8 py-3 bg-[#00E5FF] text-black text-[11px] font-black uppercase tracking-widest rounded-[2px] hover:bg-white active:translate-y-[1px] transition-all w-full">
              <Plus size={16} strokeWidth={3} />
              Tạo mới
            </button>
          </Link>
        </div>
      </div>

      {/* Content Grid (Bento Boxes) */}
      <div className="grid grid-cols-12 gap-4">
        {filteredCourses.map((course) => (
          <div 
            key={course.id} 
            className="col-span-12 md:col-span-6 lg:col-span-4 border border-[#262626] bg-[#000000] p-6 rounded-[4px] flex flex-col justify-between group hover:border-[#00E5FF] transition-all duration-500 relative"
          >
            <div className="flex justify-between items-start mb-6">
              <span className="text-[10px] text-[#006064] font-bold tracking-tighter bg-[#006064]/10 px-2 py-0.5 rounded-[2px]">
                {course.id}
              </span>
              <button className="text-[#262626] group-hover:text-[#717B7A] transition-colors">
                <MoreHorizontal size={16} />
              </button>
            </div>

            <div className="mb-8">
              <h3 className="text-[#DCE4E5] font-bold text-lg uppercase leading-tight tracking-tighter group-hover:text-[#00E5FF] transition-colors">
                {course.title}
              </h3>
            </div>

            <div className="space-y-4 pt-4 border-t border-[#262626]">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-[#717B7A]">
                <div className="flex items-center gap-1.5">
                  <User size={12} className="text-[#006064]" />
                  <span>{course.creator}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={12} className="text-[#006064]" />
                  <span>{course.time}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {course.tags.map((tag) => (
                  <div 
                    key={tag}
                    className="flex items-center gap-1 text-[9px] font-bold uppercase py-1 px-2 border border-[#262626] text-[#717B7A] group-hover:border-[#006064] group-hover:text-[#006064] transition-all"
                  >
                    <TagIcon size={10} />
                    {tag}
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#00E5FF] group-hover:w-full transition-all duration-500" />
          </div>
        ))}
        
        {filteredCourses.length === 0 && (
          <div className="col-span-12 text-center py-20 border border-dashed border-[#262626]">
            <p className="text-[#717B7A] text-xs uppercase tracking-[0.2em]">No_Results_Found_In_Database</p>
          </div>
        )}
      </div>
    </div>
  );
}