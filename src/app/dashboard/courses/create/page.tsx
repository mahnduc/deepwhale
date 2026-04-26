"use client";

import React, { useState } from "react";
import { TaskSidebar, NavTab } from "./_components/TaskSidebar";
import KnowledgeBaseAllInOne from "./_components/DataIngestion";
import QuizGenerator from "./_components/QuizGenerator";
import { TaskMainContent } from "./_components/TaskMainContent";

export default function CreateCourse() {
  const [activeTab, setActiveTab] = useState<NavTab>("KNOWLEDGE_BASE");

  return (
    <div className="flex w-full h-full items-stretch -m-8 w-[calc(100%+64px)] min-h-[calc(100vh-64px)]">
      
      {/* SIDEBAR: Sát lề trái hoàn toàn */}
      <div className="shrink-0 border-r border-[#262626] bg-[#0a0a0a]">
        <TaskSidebar 
          activeTab={activeTab} 
          onTabChange={(tab) => setActiveTab(tab)} 
        />
      </div>

      {/* CONTENT: Sát lề phải và lề dưới hoàn toàn */}
      <div className="flex-1 min-w-0 bg-black">
        <TaskMainContent isProcessing={false}>
          {/* w-full h-full để component con tự quyết định khoảng cách nội bộ */}
          <div className="w-full h-full overflow-y-auto">
            {activeTab === "KNOWLEDGE_BASE" ? (
              <div className="animate-in fade-in duration-300">
                <KnowledgeBaseAllInOne />
              </div>
            ) : (
              <div className="animate-in fade-in duration-300">
                <QuizGenerator />
              </div>
            )}
          </div>
        </TaskMainContent>
      </div>
    </div>
  );
}