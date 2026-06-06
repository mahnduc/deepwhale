import { useState, useEffect } from "react";
import { getAllKnowledgeBases } from "../lib/rag/api";
import { keyApi } from "../app/dashboard/settings/api-key/_api/key.api";
import { LocalKnowledgeSearchService, SearchResult } from "@/services/local-knowledge-search.service";

export function useHybridSearch() {
  const [knowledgeBases, setKnowledgeBases] = useState<string[]>([]);
  const [selectedKB, setSelectedKB] = useState<string>("");
  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  
  const [apiKey, setApiKey] = useState<string>("");
  const [showKey, setShowKey] = useState<boolean>(false);

  const [results, setResults] = useState<SearchResult[]>([]);
  const [llmResponse, setLlmResponse] = useState<string>("");

  useEffect(() => {
    async function initPage() {
      try {
        const kbs = await getAllKnowledgeBases();
        setKnowledgeBases(kbs);
        const savedKey = await keyApi.getKey(1);
        if (savedKey) setApiKey(savedKey);
      } catch (err) {
        console.error("Lỗi khởi tạo dữ liệu nền tảng:", err);
      }
    }
    initPage();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKB || !query.trim()) return;

    setLoading(true);
    setResults([]);
    setLlmResponse("");

    try {
      const activeKey = await keyApi.getKey(1);

      if (!activeKey) {
        throw new Error("Vui lòng cấu hình API Key trước khi thực hiện tìm kiếm.");
      }

      const searchResults = await LocalKnowledgeSearchService.search(selectedKB, query);
      setResults(searchResults);
      console.log("[useHybridSearch]",searchResults)
      if (searchResults.length > 0) {
        const answer = await LocalKnowledgeSearchService.generateAnswer(query, searchResults, activeKey);
        setLlmResponse(answer);
      } else {
        setLlmResponse("Dựa trên bộ tri thức hiện tại, hệ thống không tìm thấy đủ dữ liệu phù hợp để trả lời câu hỏi này.");
      }

    } catch (error: any) {
      setLlmResponse(`Đã xảy ra lỗi khi phân tích cú pháp tài liệu: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return {
    knowledgeBases,
    selectedKB,
    setSelectedKB,
    query,
    setQuery,
    loading,
    apiKey,
    setApiKey,
    showKey,
    setShowKey,
    results,
    llmResponse,
    handleSearch
  };
}