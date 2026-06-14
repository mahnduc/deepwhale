"use client";

import React from "react";
import { Loader2, MessageCircleQuestion, Sparkles } from "lucide-react";

interface QuizToolbarProps {
  isActionDisabled: boolean;
  requestedQuestions: number;
  setRequestedQuestions: (val: number) => void;
  onTriggerCreateQuiz: () => Promise<void>;
  isPending: boolean;
  isGeneratingQuiz: boolean;
  isIngesting: boolean;
}

export function QuizToolbar({
  isActionDisabled,
  requestedQuestions,
  setRequestedQuestions,
  onTriggerCreateQuiz,
  isPending,
  isGeneratingQuiz,
  isIngesting,
}: QuizToolbarProps) {
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valueStr = e.target.value;
    
    if (valueStr === "") {
      setRequestedQuestions(0);
      return;
    }

    const valueNum = Number(valueStr);
    
    if (valueNum > 15) {
      setRequestedQuestions(15);
    } else {
      setRequestedQuestions(valueNum);
    }
  };

  const handleBlur = () => {
    if (requestedQuestions < 1) {
      setRequestedQuestions(1);
    }
  };

  return (
    <div className="w-full p-5 bg-white border border-gray-100 rounded-3xl shadow-sm flex flex-col sm:flex-row items-center gap-5 justify-between transition-all duration-300 animate-scale-in">
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="bg-sky-50 text-sky-600 p-2.5 rounded-xl shrink-0">
          <MessageCircleQuestion size={22} />
        </div>
        <div className="flex flex-col flex-1 sm:flex-none">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
            Chọn số lượng câu hỏi muốn tạo (Tối đa 15)
          </label>
          <input
            type="number"
            min={1}
            max={15}
            disabled={isActionDisabled}
            value={requestedQuestions === 0 ? "" : requestedQuestions}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className="w-full sm:w-24 px-3 py-1.5 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-sky-500 transition-colors disabled:bg-gray-50 disabled:text-gray-400"
          />
        </div>
      </div>

      <button
        disabled={isActionDisabled || requestedQuestions < 1}
        onClick={onTriggerCreateQuiz}
        className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-md relative overflow-hidden
          ${isPending 
            ? "bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 text-white animate-pulse" 
            : "bg-linear-to-r from-sky-500 via-indigo-500 to-purple-500 hover:opacity-95 text-white active:scale-[0.98] hover:shadow-lg hover:shadow-sky-500/10"}
        `}
      >
        {isGeneratingQuiz ? (
          <>
            <Loader2 className="animate-spin" size={18} />
            <span>Đang thiết lập câu hỏi...</span>
          </>
        ) : isIngesting ? (
          <>
            <Loader2 className="animate-spin" size={18} />
            <span>Đang nạp file dữ liệu gốc...</span>
          </>
        ) : (
          <>
            <Sparkles size={18} className="animate-bounce" style={{ animationDuration: '2s' }} />
            <span>Tạo mới</span>
          </>
        )}
      </button>
    </div>
  );
}