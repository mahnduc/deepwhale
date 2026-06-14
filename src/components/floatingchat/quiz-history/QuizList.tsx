"use client";

import React from 'react';
import { Folder, X } from 'lucide-react';

interface QuizFileItem {
  fileName: string;
  displayName: string;
  fileHandle: FileSystemFileHandle;
}

interface QuizListProps {
  quizzes: QuizFileItem[];
  onSelectQuiz: (quiz: QuizFileItem) => void;
  onDeleteQuiz: (quiz: QuizFileItem) => void;
}

export const QuizList: React.FC<QuizListProps> = ({ quizzes, onSelectQuiz, onDeleteQuiz }) => {
  return (
    <div className="w-full h-full flex flex-col p-5 overflow-y-auto custom-scrollbar">
      {quizzes.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-8 bg-slate-50/50">
          <Folder size={48} className="text-slate-300 stroke-[1.5]" />
          <p className="text-slate-400 text-sm mt-3 font-medium">Lịch sử luyện tập hiện tại trống.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-max">
          {quizzes.map((quiz) => (
            <div
              key={quiz.fileName}
              onClick={() => onSelectQuiz(quiz)}
              className="group relative bg-white p-4 pr-10 rounded-xl border border-slate-200/80 hover:border-emerald-500/50 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex items-center gap-3"
            >
              <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-200 shrink-0">
                <Folder size={20} fill="currentColor" className="fill-transparent group-hover:fill-emerald-200" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-slate-800 truncate group-hover:text-emerald-600 transition-colors">
                  {quiz.displayName}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                  Bấm để xem biểu đồ tiến trình
                </p>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Bạn có chắc chắn muốn xóa lịch sử của "${quiz.displayName}" không?`)) {
                    onDeleteQuiz(quiz);
                  }
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all duration-200 active:scale-95"
                title="Xóa lịch sử file này"
              >
                <X size={14} strokeWidth={2.5} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};