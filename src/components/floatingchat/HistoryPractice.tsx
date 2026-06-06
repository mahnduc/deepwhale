"use client";

import React, { useEffect, useState } from 'react';
import { QuizLoader } from './quiz-history/QuizLoader';
import { QuizDetailChart } from './quiz-history/QuizDetailChart';
import { QuizList } from './quiz-history/QuizList';
import { ClipboardList } from 'lucide-react';

interface QuizFileItem {
  fileName: string;
  displayName: string;
  fileHandle: FileSystemFileHandle;
}

interface QuizAttempt {
  attemptId: string | number;
  timestamp: string | number;
  accuracy: number;
  score: number;
  totalQuestions: number;
  duration: number;
}

interface ChartDataPoint extends QuizAttempt {
  name: string;
  displayDate: string;
  displayTime: string;
}

interface QuizJsonData {
  quizFileName: string;
  attempts: QuizAttempt[];
}

export default function HistoryPracticeWindow() {
  const [quizzes, setQuizzes] = useState<QuizFileItem[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<QuizJsonData | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function scanOPFSHistory() {
      try {
        setLoading(true);
        const root = await navigator.storage.getDirectory();
        const historyDir = await root.getDirectoryHandle('history_quiz', { create: true });
        const quizList: QuizFileItem[] = [];
        for await (const [name, handle] of (historyDir as any).entries()) {
          if (handle.kind === 'file' && name.endsWith('.json')) {
            quizList.push({
              fileName: name,
              displayName: name.replace('.json', ''),
              fileHandle: handle as FileSystemFileHandle
            });
          }
        }
        setQuizzes(quizList);
      } catch (err) {
        console.error("Lỗi khi đọc OPFS:", err);
        setError("Không thể truy cập dữ liệu lịch sử từ OPFS.");
      } finally {
        setLoading(false);
      }
    }
    scanOPFSHistory();
  }, []);

  const handleSelectQuiz = async (quiz: QuizFileItem) => {
    try {
      const file = await quiz.fileHandle.getFile();
      const text = await file.text();
      const data: QuizJsonData = JSON.parse(text);
      if (data.attempts && Array.isArray(data.attempts)) {
        const sortedAttempts: ChartDataPoint[] = [...data.attempts]
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
          .map((attempt, index) => {
            const date = new Date(attempt.timestamp);
            return {
              ...attempt,
              name: `Lần ${index + 1}`,
              displayDate: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
              displayTime: date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            };
          });
        setSelectedQuiz(data);
        setChartData(sortedAttempts);
      } else {
        alert("File dữ liệu không đúng định dạng lịch sử.");
      }
    } catch (err) {
      console.error("Lỗi khi đọc chi tiết file:", err);
      alert("Không thể đọc file dữ liệu này.");
    }
  };

  if (loading || error) {
    return <QuizLoader loading={loading} error={error} />;
  }

  return (
    <div className="w-full h-full flex flex-col bg-white font-sans antialiased text-slate-600 selection:bg-emerald-100 selection:text-emerald-900">
      <div className="flex-1 w-full h-full p-6 overflow-auto custom-scrollbar animate-in fade-in duration-300">
        {selectedQuiz ? (
          <div className="w-full bg-white p-2 animate-in slide-in-from-right-4 duration-200">
            <QuizDetailChart
              quizTitle={selectedQuiz.quizFileName.replace('.json', '')}
              chartData={chartData}
              onBack={() => setSelectedQuiz(null)}
            />
          </div>
        ) : quizzes.length > 0 ? (
          <div className="w-full bg-white p-2 animate-in slide-in-from-left-4 duration-200">
            <QuizList quizzes={quizzes} onSelectQuiz={handleSelectQuiz} />
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center py-16 text-center animate-in zoom-in-95 duration-200">
            <div className="h-14 w-14 flex items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-4 border border-emerald-100/50">
              <ClipboardList size={26} strokeWidth={1.5} />
            </div>
            <h3 className="text-sm font-bold text-slate-700 tracking-wide">Chưa có lịch sử làm bài</h3>
            <p className="text-xs text-slate-400 max-w-xs mt-1 leading-relaxed">
              Hãy hoàn thành ít nhất một bài trắc nghiệm để hệ thống bắt đầu theo dõi và phân tích xu hướng học tập nhé!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}