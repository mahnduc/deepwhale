'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  HelpCircle, 
  BookOpen, 
  Sparkles, 
  UserPen, 
  FolderOpen, 
  Bookmark, 
  Plus, 
  X
} from "lucide-react";
import Link from 'next/link';

import VocabularyList from './_components/VocabularyList';
import { useCollection } from '@/hooks/useCollection';
import { QuizCard } from './_components/QuizCard';
import QuizPracticeScreen from '@/components/quiz/QuizPracticeScreen';
import { SavedQuizData } from '@/lib/rag/qa-generator';

import { 
  QuizCardData, 
  QuizHistoryAttempt, 
  QuizHistoryFile, 
  QuizFileContent 
} from '@/types/quiz.type';
import QuizHistoryDashboard from '@/components/quiz/QuizHistory';

export default function LibraryPage() {
  const [quizzes, setQuizzes] = useState<QuizCardData[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState<boolean>(true);
  const [activeQuiz, setActiveQuiz] = useState<QuizCardData | null>(null);
  
  // Trạng thái quản lý xem lịch sử chuẩn hóa theo Types
  const [historyQuiz, setHistoryQuiz] = useState<QuizCardData | null>(null);
  const [historyData, setHistoryData] = useState<QuizHistoryAttempt[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  const hasScanned = useRef(false);

  const {
    collections,
    selectedCollection,
    isLoading: loadingCollections,
    error: collectionError,
    isModalOpen,
    newCollectionName,
    isDeleting,
    deletingWordIndex,
    localWordsList,
    isAddModalOpen,
    newWord,
    isAddingWord,
    setIsModalOpen,
    setNewCollectionName,
    setIsAddModalOpen,
    setNewWord,
    handleSpeak,
    handleCreateCollection,
    handleSelectCollection,
    handleDeleteCollection,
    handleDeleteWord,
    handleAddWord,
    resetSelection,
  } = useCollection();

  useEffect(() => {
    if (hasScanned.current) return;
    hasScanned.current = true;

    async function scanOPFSForQuizzes() {
      try {
        setLoadingQuizzes(true);
        const root = await navigator.storage.getDirectory();
        const quizMap = new Map<string, QuizCardData>();

        for await (const [name, handle] of root.entries()) {
          if (handle.kind === 'directory' && name !== 'history_quiz') {
            const dirHandle = await root.getDirectoryHandle(name);

            for await (const [fileName, fileHandle] of dirHandle.entries()) {
              if (fileHandle.kind === 'file' && fileName.endsWith('_quiz.json')) {
                const uniqueKey = `${name}/${fileName}`;
                if (quizMap.has(uniqueKey)) continue;

                try {
                  const file = await (fileHandle as FileSystemFileHandle).getFile();
                  const text = await file.text();
                  const content = JSON.parse(text) as QuizFileContent;

                  quizMap.set(uniqueKey, {
                    id: uniqueKey, 
                    fileName: fileName,
                    knowledgeBase: content.knowledgeBase || name,
                    createdAt: content.createdAt || new Date().toISOString(),
                    totalQuestions: content.totalQuestions || content.questions?.length || 0,
                    rawContent: content
                  });
                } catch (jsonErr) {
                  console.error(`Lỗi parse JSON tệp ${fileName}:`, jsonErr);
                }
              }
            }
          }
        }
        setQuizzes(Array.from(quizMap.values()));
      } catch (err) {
        console.error("Không thể quét hệ thống tệp OPFS:", err);
      } finally {
        setLoadingQuizzes(false);
      }
    }

    scanOPFSForQuizzes();
  }, []);

  const handleOpenHistory = async (quiz: QuizCardData) => {
    setHistoryQuiz(quiz);
    setLoadingHistory(true);
    try {
      const root = await navigator.storage.getDirectory();
      const historyDirHandle = await root.getDirectoryHandle("history_quiz");
      
      const baseName = quiz.fileName.replace('_quiz.json', '').replace('.json', '');
      const historyFileName = `${baseName}_history.json`;
      
      const fileHandle = await historyDirHandle.getFileHandle(historyFileName);
      const file = await fileHandle.getFile();
      const text = await file.text();
      const parsed = JSON.parse(text) as QuizHistoryFile;
      
      const attempts = parsed.attempts || [];
      setHistoryData([...attempts].reverse());
    } catch (err) {
      setHistoryData([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return dateString.split('T')[0];
    } catch {
      return "2026-05-30";
    }
  };

  if (activeQuiz && activeQuiz.rawContent) {
    const formattedQuizData = activeQuiz.rawContent as unknown as SavedQuizData;
    return (
      <div className="w-full flex flex-col items-center justify-center p-5 lg:p-8 bg-[#F7F9FB] min-h-screen">
        <QuizPracticeScreen
          quizData={formattedQuizData} 
          onBack={() => setActiveQuiz(null)}
        />
      </div>
    );
  }

  if (historyQuiz) {
    return (
      <QuizHistoryDashboard
        historyQuiz={historyQuiz}
        historyData={historyData}
        loadingHistory={loadingHistory}
        onBack={() => setHistoryQuiz(null)}
        formatDate={formatDate}
      />
    );
  }

  if (selectedCollection) {
    return (
      <div className="w-full flex flex-col gap-8 p-5 lg:p-8 bg-[#F7F9FB] min-h-screen animate-in fade-in duration-300">
        <VocabularyList
          selectedCollection={selectedCollection}
          isLoading={loadingCollections}
          error={collectionError}
          scrollbarClass="scrollbar-thin scrollbar-thumb-[#E5E5E5] scrollbar-track-transparent hover:scrollbar-thumb-[#B2BEC3]"
          isDeleting={isDeleting}
          deletingWordIndex={deletingWordIndex}
          localWordsList={localWordsList}
          isAddModalOpen={isAddModalOpen}
          newWord={newWord}
          isAddingWord={isAddingWord}
          setIsAddModalOpen={setIsAddModalOpen}
          setNewWord={setNewWord}
          onBack={resetSelection}
          onSpeak={handleSpeak}
          onDeleteCollection={handleDeleteCollection}
          onDeleteWord={handleDeleteWord}
          onAddWord={handleAddWord}
        />
      </div>
    );
  }

  const isLoadingTotal = loadingQuizzes || loadingCollections;

  return (
    <div className="w-full flex flex-col gap-8 p-5 lg:p-8 animate-in fade-in duration-500 bg-[#F7F9FB] min-h-screen selection:bg-[#00CEC9]/20 selection:text-[#00b2b0]">

      {/* TRẠNG THÁI LOADING TỔNG THỂ */}
      {isLoadingTotal && (
        <div className="flex flex-col items-center justify-center text-center py-32 bg-white rounded-2xl border-2 border-[#E5E5E5] shadow-sm max-w-xl mx-auto w-full mt-12 animate-pulse">
          <div className="relative flex items-center justify-center mb-5">
            <div className="w-12 h-12 border-4 border-[#00CEC9]/20 border-t-[#00CEC9] rounded-full animate-spin"></div>
            <div className="absolute w-6 h-6 border-4 border-transparent border-b-[#FF3399] rounded-full animate-spin [animation-duration:0.8s] reverse"></div>
          </div>
          <h3 className="text-sm font-black text-[#2D3436] uppercase tracking-wider mb-1">Hệ thống đang xử lý</h3>
          <p className="text-xs text-[#B2BEC3] font-semibold uppercase tracking-wide px-6">Đang cấu trúc lại không gian lưu trữ cục bộ...</p>
        </div>
      )}

      {!isLoadingTotal && (
        <div className="flex flex-col gap-12">
          
          <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-3 duration-500">
            {/* Header phân đoạn */}
            <div className="flex items-center justify-between border-b-2 border-slate-200/60 pb-4 px-1">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#00CEC9]/10 flex items-center justify-center border border-[#00CEC9]/20 shadow-sm">
                  <BookOpen size={20} className="text-[#00CEC9]" />
                </div>
                <div>
                  <h2 className="text-base font-[900] text-[#2D3436] uppercase tracking-wider">Bộ sưu tập từ vựng</h2>
                  <p className="text-[11px] text-[#B2BEC3] font-bold uppercase tracking-wide mt-0.5">Local Storage</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-[#00CEC9] hover:bg-[#00b2b0] text-white text-xs font-black rounded-xl active:translate-y-0.5 uppercase tracking-wide transition-all shadow-[0_4px_0_0_#00b2b0] active:shadow-none border border-[#00b2b0] flex items-center gap-2 cursor-pointer"
              >
                <Plus size={14} strokeWidth={3} /> Thêm bộ mới
              </button>
            </div>

            {collections.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-16 bg-white rounded-2xl border-2 border-dashed border-[#E5E5E5] px-6">
                <div className="w-14 h-14 bg-[#00CEC9]/5 text-[#00CEC9] rounded-2xl flex items-center justify-center mb-4 border border-[#00CEC9]/10 shadow-inner">
                  <FolderOpen size={24} />
                </div>
                <h4 className="text-sm font-black text-[#2D3436] uppercase tracking-wide">Thư mục từ vựng trống</h4>
                <p className="text-xs text-[#B2BEC3] font-semibold mt-1 max-w-sm">
                  Bạn chưa khởi tạo không gian lưu trữ từ vựng nào. Hãy nhấn nút phía trên để bắt đầu tích lũy.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-stretch">
                {collections.map((fileName, index) => (
                  <div key={index} className="w-full flex flex-col group">
                    <button
                      type="button"
                      onClick={() => handleSelectCollection(fileName)}
                      className="bg-white border-2 border-[#E5E5E5] hover:border-[#00CEC9] rounded-2xl px-6 py-5 text-left shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between h-full w-full select-none"
                    >
                      <div className="w-full flex flex-col h-full justify-between gap-5">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 shrink-0 rounded-xl bg-[#00CEC9]/10 flex items-center justify-center border border-[#00CEC9]/20 group-hover:bg-[#00CEC9] group-hover:text-white transition-colors duration-200">
                            <FolderOpen size={24} className="text-[#00CEC9] group-hover:text-white transition-colors duration-200" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-base font-black text-[#2D3436] tracking-tight truncate group-hover:text-[#00CEC9] transition-colors">
                              {fileName.replace('.json', '')}
                            </h3>
                            <p className="text-[11px] text-[#B2BEC3] font-bold uppercase tracking-wider mt-0.5">
                              Tài liệu cấu trúc
                            </p>
                          </div>
                        </div>
                        
                        <div className="w-full pt-3 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md uppercase">Từ vựng</span>
                          <span className="text-xs font-black text-[#00CEC9] uppercase tracking-wider flex items-center gap-1">
                            Khám phá <span className="transform group-hover:translate-x-1 transition-transform">&rarr;</span>
                          </span>
                        </div>
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-3 duration-500 delay-75">
            <div className="flex items-center justify-between border-b-2 border-slate-200/60 pb-4 px-1">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#FF3399]/10 flex items-center justify-center border border-[#FF3399]/20 shadow-sm">
                  <UserPen size={20} className="text-[#FF3399]" />
                </div>
                <div>
                  <h2 className="text-base font-[900] text-[#2D3436] uppercase tracking-wider">Kho đề trắc nghiệm</h2>
                  <p className="text-[11px] text-[#B2BEC3] font-bold uppercase tracking-wide mt-0.5">Local Storage</p>
                </div>
              </div>
              <Link href="/dashboard/discover">
                <button type="button" className="px-4 py-2 bg-[#FF3399] text-white text-xs font-black rounded-xl active:translate-y-0.5 uppercase tracking-wide transition-all shadow-[0_4px_0_0_#D12A7E] active:shadow-none border border-[#D12A7E] flex items-center gap-2 cursor-pointer">
                  <Sparkles size={14} className="text-white animate-pulse" /> Tạo đề mới
                </button>
              </Link>
            </div>

            {quizzes.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-16 bg-white rounded-2xl border-2 border-dashed border-[#E5E5E5] px-6">
                <div className="w-14 h-14 bg-[#FF3399]/5 text-[#FF3399] rounded-2xl flex items-center justify-center mb-4 border border-[#FF3399]/10 shadow-inner">
                  <HelpCircle size={24} />
                </div>
                <h4 className="text-sm font-black text-[#2D3436] uppercase tracking-wide">Kho lưu trữ trống</h4>
                <p className="text-xs text-[#B2BEC3] font-semibold mt-1 max-w-sm">
                  Chưa tìm thấy bộ đề trắc nghiệm nào. Bạn có thể xây dựng bộ câu hỏi tự động từ các file tài liệu PDF hoặc Markdown.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-stretch">
                {quizzes.map((quiz) => (
                  <div key={quiz.id} className="w-full flex flex-col">
                    <QuizCard
                      quiz={quiz}
                      onClick={() => setActiveQuiz(quiz)} 
                      onHistoryClick={() => handleOpenHistory(quiz)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white border-2 border-[#E5E5E5] rounded-2xl p-7 w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer border border-transparent hover:border-slate-200"
            >
              <X size={16} strokeWidth={3} />
            </button>

            <div className="mb-6 flex gap-3.5 items-start">
              <div className="w-10 h-10 rounded-xl bg-[#00CEC9]/10 flex items-center justify-center border border-[#00CEC9]/20 shrink-0">
                <Plus size={18} className="text-[#00CEC9]" strokeWidth={3} />
              </div>
              <div>
                <h2 className="text-base font-black text-[#2D3436] tracking-tight uppercase">
                  Tạo không gian mới
                </h2>
                <p className="text-xs text-[#B2BEC3] mt-0.5 font-medium leading-relaxed">
                  Phân tách các trường từ vựng theo mục tiêu ôn luyện riêng biệt của bạn.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateCollection} className="space-y-5">
              <div>
                <label className="block text-[11px] font-black text-[#B2BEC3] uppercase tracking-wider mb-2">
                  Tên bộ sưu tập từ vựng
                </label>
                <input
                  type="text"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="Ví dụ: IELTS Target 7.5, N3 Kanji..."
                  className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#00CEC9] text-[#2D3436] font-bold placeholder:text-slate-400 bg-[#F7F9FB] focus:bg-white transition-all shadow-inner"
                  autoFocus
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border-2 border-slate-200 text-xs font-black text-slate-600 hover:bg-slate-50 active:translate-y-0.5 transition-all cursor-pointer uppercase tracking-wider"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={!newCollectionName.trim()}
                  className="px-5 py-2.5 rounded-xl bg-[#00CEC9] text-white text-xs font-black uppercase tracking-wider hover:bg-[#00b2b0] active:translate-y-0.5 transition-all shadow-[0_4px_0_0_#00b2b0] active:shadow-none border border-[#00b2b0] disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                  Xác nhận tạo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
</div>
  );
}