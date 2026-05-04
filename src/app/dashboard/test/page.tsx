"use client";

import { initializeSearchFromStorage } from "@/app/lib/brain/api";
import { BM25Search, SearchResult } from "@/app/lib/brain/search/BM25Search";
import { useState, useEffect } from "react";

export default function SearchPage() {
  const [searchEngine, setSearchEngine] = useState<BM25Search | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Load Index từ OPFS khi trang vừa mở
  useEffect(() => {
    async function loadEngine() {
      // Thay "document.md" bằng tên file bạn đã ingest trước đó
      const engine = await initializeSearchFromStorage("test-file.md");
      if (engine) {
        setSearchEngine(engine);
      }
      setIsLoading(false);
    }
    loadEngine();
  }, []);

  // 2. Hàm xử lý tìm kiếm khi người dùng nhập
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (searchEngine && value.trim().length > 2) {
      const searchResults = searchEngine.search(value, 5);
      setResults(searchResults);
    } else {
      setResults([]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">BM25 Local Search</h1>

      {/* Trạng thái load index */}
      {isLoading ? (
        <div className="text-blue-500">Đang tải Index từ OPFS...</div>
      ) : !searchEngine ? (
        <div className="text-red-500 mb-4">
          Chưa tìm thấy Index. Vui lòng chạy Ingest dữ liệu trước.
        </div>
      ) : (
        <div className="text-green-600 mb-4">Hệ thống tìm kiếm sẵn sàng!</div>
      )}

      {/* Ô nhập tìm kiếm */}
      <input
        type="text"
        value={query}
        onChange={handleSearch}
        placeholder="Nhập từ khóa tìm kiếm (vd: TCP protocol)..."
        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
        disabled={!searchEngine}
      />

      {/* Danh sách kết quả */}
      <div className="mt-8 space-y-6">
        {results.length > 0 ? (
          results.map((res, index) => (
            <div key={index} className="p-4 border rounded-md bg-white shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-semibold text-blue-600">
                  Score: {res.score.toFixed(4)}
                </span>
                <span className="text-xs text-gray-400">{res.chunk.metadata.chunkId}</span>
              </div>
              
              {/* Hiển thị Highlights */}
              <div className="text-gray-700 leading-relaxed">
                {res.highlights.map((h, i) => (
                  <p key={i} dangerouslySetInnerHTML={{ __html: h.replace(/\*\*(.*?)\*\*/g, '<mark className="bg-yellow-200">$1</mark>') }} />
                ))}
              </div>
            </div>
          ))
        ) : (
          query.length > 2 && <p className="text-gray-500">Không tìm thấy kết quả phù hợp.</p>
        )}
      </div>
    </div>
  );
}