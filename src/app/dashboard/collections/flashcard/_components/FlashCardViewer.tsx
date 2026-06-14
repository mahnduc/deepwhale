"use client";

import { useState, useEffect } from "react";
import { Brain, RotateCcw, ArrowLeft, CheckCircle2, XCircle, HelpCircle } from "lucide-react";

interface PartOfSpeech {
  partOfSpeech: string;
  definitionEn: string;
  definitionVi: string;
}

interface FlashCardItem {
  word: string;
  phonetics: string[];
  partsOfSpeech: PartOfSpeech[];
}

interface FlashCardViewerProps {
  cards: FlashCardItem[];
  currentIndex: number;
  isFlipped: boolean;
  setIsFlipped: (value: boolean) => void;
  nextCard: () => void;
  prevCard: () => void;
}

interface MatchingItem {
  id: string;
  matchId: string;
  text: string;
  type: "en" | "vi";
}

export default function FlashCardViewer({
  cards,
  currentIndex,
  isFlipped,
  setIsFlipped,
  nextCard,
  prevCard,
}: FlashCardViewerProps) {
  const currentCard = cards[currentIndex];

  // --- 1. STATE TIẾN TRÌNH FLASHCARD ---
  const [viewedCards, setViewedCards] = useState<Set<number>>(new Set());
  const [isPracticeMode, setIsPracticeMode] = useState<boolean>(false);

  // --- 2. STATE TRÒ CHƠI GHÉP CẶP ---
  const [matchingItems, setMatchingItems] = useState<MatchingItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set());
  
  // State lưu trữ các ID đang bị lỗi (chọn sai cặp) để hiện UI màu đỏ
  const [incorrectIds, setIncorrectIds] = useState<Set<string>>(new Set());
  // Khóa tương tác tạm thời khi đang diễn ra hiệu ứng báo lỗi (0.8 giây)
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Theo dõi tiến trình lật mặt sau của thẻ
  useEffect(() => {
    if (isFlipped && currentCard) {
      setViewedCards((prev) => {
        const next = new Set(prev);
        next.add(currentIndex);
        return next;
      });
    }
  }, [isFlipped, currentIndex, currentCard]);

  // Reset toàn bộ khi đổi bộ sưu tập
  useEffect(() => {
    setViewedCards(new Set());
    setIsPracticeMode(false);
    setSelectedId(null);
    setMatchedIds(new Set());
    setIncorrectIds(new Set());
    setIsProcessing(false);
  }, [cards]);

  const hasFinishedAll = cards.length > 0 && viewedCards.size === cards.length;

  // --- 3. KHỞI TẠO DỮ LIỆU GAME GHÉP CẶP ---
  const startPractice = () => {
    const listEn: MatchingItem[] = [];
    const listVi: MatchingItem[] = [];

    cards.forEach((card) => {
      const primaryVi = card.partsOfSpeech?.[0]?.definitionVi || "Chưa có nghĩa";

      listEn.push({
        id: `en-${card.word}`,
        matchId: card.word,
        text: card.word,
        type: "en",
      });

      listVi.push({
        id: `vi-${card.word}`,
        matchId: card.word,
        text: primaryVi,
        type: "vi",
      });
    });

    const combined = [...listEn, ...listVi];
    for (let i = combined.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [combined[i], combined[j]] = [combined[j], combined[i]];
    }

    setMatchingItems(combined);
    setMatchedIds(new Set());
    setIncorrectIds(new Set());
    setSelectedId(null);
    setIsProcessing(false);
    setIsPracticeMode(true);
  };

  // --- 4. XỬ LÝ CLICK CHỌN CẶP ---
  const handleItemClick = (item: MatchingItem) => {
    if (isProcessing || matchedIds.has(item.id) || incorrectIds.has(item.id)) return;

    // Trường hợp chưa chọn ô nào
    if (!selectedId) {
      setSelectedId(item.id);
      return;
    }

    // Click lại chính ô đang chọn -> Hủy chọn
    if (selectedId === item.id) {
      setSelectedId(null);
      return;
    }

    const firstItem = matchingItems.find((i) => i.id === selectedId);
    if (!firstItem) return;

    // Kiểm tra tính đúng đắn của cặp ghép
    if (firstItem.matchId === item.matchId && firstItem.type !== item.type) {
      // ĐÚNG CẶP
      setMatchedIds((prev) => {
        const next = new Set(prev);
        next.add(firstItem.id);
        next.add(item.id);
        return next;
      });
      setSelectedId(null);
    } else {
      // SAI CẶP -> Kích hoạt hiệu ứng báo lỗi đỏ
      setIsProcessing(true);
      setIncorrectIds(new Set([firstItem.id, item.id]));
      setSelectedId(null);

      // Giữ màu đỏ hiển thị trong 800ms trước khi reset về trạng thái bình thường
      setTimeout(() => {
        setIncorrectIds(new Set());
        setIsProcessing(false);
      }, 800);
    }
  };

  if (!currentCard) return null;

  if (isPracticeMode) {
    const isGameWon = matchedIds.size === matchingItems.length && matchingItems.length > 0;

    return (
      <div className="w-full max-w-2xl flex flex-col items-center py-4 animate-fade-in">
        <div className="flex justify-between items-center w-full mb-6">
          <div className="space-y-0.5">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <Brain className="w-5 h-5 text-[#00CEC9]" />
              Thử thách Ghép Cặp
            </h3>
            <p className="text-xs text-slate-500">Chọn 1 từ tiếng Anh và Nghĩa tiếng Việt tương ứng</p>
          </div>
          <button
            onClick={() => setIsPracticeMode(false)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Xem Flashcard
          </button>
        </div>

        {isGameWon ? (
          <div className="w-full bg-emerald-50 border border-emerald-100 rounded-3xl p-8 text-center shadow-xs my-8">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h4 className="text-lg font-black text-emerald-800">Xuất sắc hoàn thành!</h4>
            <p className="text-sm text-emerald-600 max-w-xs mx-auto mt-1 leading-relaxed">
              Tuyệt vời! Bạn đã ghi nhớ chính xác toàn bộ các từ vựng trong danh sách này.
            </p>
            <div className="flex gap-3 justify-center mt-6">
              <button
                onClick={startPractice}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all shadow-sm"
              >
                <RotateCcw className="w-4 h-4" />
                Chơi lại lần nữa
              </button>
              <button
                onClick={() => setIsPracticeMode(false)}
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-xl transition-all shadow-sm"
              >
                Xem lại thẻ
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
            {matchingItems.map((item) => {
              const isSelected = selectedId === item.id;
              const isMatched = matchedIds.has(item.id);
              const isIncorrect = incorrectIds.has(item.id);

              return (
                <button
                  key={item.id}
                  disabled={isMatched || isProcessing}
                  onClick={() => handleItemClick(item)}
                  className={`relative p-4 min-h-[85px] flex flex-col items-center justify-center text-center rounded-2xl font-bold text-sm border transition-all duration-200 overflow-hidden
                    ${
                      isMatched
                        ? "bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed pointer-events-none line-through"
                        : isIncorrect
                        ? "bg-red-50 border-red-400 text-red-600 shadow-xs animate-shake"
                        : isSelected
                        ? "bg-[#00CEC9] border-[#00CEC9] text-white scale-98 shadow-md"
                        : "bg-white border-slate-200 text-slate-700 hover:border-[#00CEC9] hover:shadow-xs active:scale-95"
                    }`}
                >
                  <div className="absolute top-1.5 right-1.5 opacity-80">
                    {isMatched && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                    {isIncorrect && <XCircle className="w-3.5 h-3.5 text-red-500 animate-pulse" />}
                    {isSelected && <HelpCircle className="w-3.5 h-3.5 text-white/70" />}
                  </div>

                  <span className="line-clamp-3 leading-snug px-1">{item.text}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-md flex-1 flex flex-col items-center justify-center min-h-[380px]">
      <div className="text-slate-400 text-xs font-black tracking-widest mb-2 bg-slate-200/60 px-3 py-1 rounded-full">
        {currentIndex + 1} / {cards.length}
      </div>

      <div
        className="w-full aspect-[4/3] min-h-[260px] cursor-pointer group [perspective:1000px] mb-6"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className={`relative w-full h-full rounded-3xl shadow-lg border border-slate-100 bg-white transition-transform duration-500 [transform-style:preserve-3d] ${
            isFlipped ? "[transform:rotateY(180deg)]" : ""
          }`}
        >
          <div className="absolute inset-0 p-6 flex flex-col justify-between [backface-visibility:hidden] bg-slate-50/60 border border-slate-100 rounded-3xl">
            <div className="flex justify-between items-center w-full">
              <span className="px-2.5 py-0.5 bg-slate-200/60 text-slate-700 rounded-lg text-[11px] font-extrabold uppercase tracking-wider">
                English
              </span>
            </div>

            <div className="text-center my-auto">
              <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight mb-2.5">
                {currentCard.word}
              </h2>

              {currentCard.phonetics?.[0] && (
                <p className="text-teal-600 font-mono text-base bg-teal-50 inline-block px-3 py-0.5 rounded-md border border-teal-100/50 font-semibold">
                  {currentCard.phonetics[0]}
                </p>
              )}
            </div>
          </div>

          <div
            className="absolute inset-0 p-6 flex flex-col justify-between text-white rounded-3xl [backface-visibility:hidden] [transform:rotateY(180deg)] shadow-inner"
            style={{ backgroundColor: "#2D3748" }}
          >
            <div className="flex justify-between items-center w-full">
              <span className="px-2.5 py-0.5 bg-white/20 text-teal-100 rounded-lg text-[11px] font-extrabold uppercase tracking-wider">
                Tiếng Việt
              </span>
            </div>

            <div className="my-auto overflow-y-auto max-h-[150px] pr-1 text-left w-full scrollbar-thin">
              {currentCard.partsOfSpeech?.map((pos, idx) => (
                <div key={idx} className="mb-3 last:mb-0">
                  <div className="inline-block px-2 py-0.5 bg-teal-600 text-slate-100 rounded text-[10px] font-black uppercase mb-1">
                    {pos.partOfSpeech}
                  </div>

                  <p className="text-base font-bold text-teal-100 leading-snug">
                    {pos.definitionVi}
                  </p>

                  <p className="text-xs text-slate-400 mt-0.5 italic font-light opacity-90">
                    En: {pos.definitionEn}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 w-full">
        <div className="flex items-center gap-4">
          <button
            onClick={prevCard}
            className="p-3 bg-white hover:bg-slate-100 text-slate-600 rounded-2xl shadow-sm active:scale-95 transition-all border border-slate-200/60"
            title="Từ trước đó"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          <button
            onClick={nextCard}
            className="p-3 bg-white hover:bg-slate-100 text-slate-600 rounded-2xl shadow-sm active:scale-95 transition-all border border-slate-200/60"
            title="Từ tiếp theo"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>

        {hasFinishedAll && (
          <button
            onClick={startPractice}
            className="mt-2 w-full max-w-xs inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#00CEC9] text-white rounded-2xl font-black text-sm shadow-md hover:bg-[#00b4b1] active:scale-98 transition-all animate-bounce"
          >
            <Brain className="w-4 h-4" />
            Thử thách ghi nhớ
          </button>
        )}
      </div>
    </div>
  );
}