// src/app/tools/tomarkdown/_hooks/usePdfProcessor.ts
import { useState } from 'react';
import { convertPdfToMarkdown } from '../_lib/parser';

export const usePdfProcessor = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [markdown, setMarkdown] = useState("");

  const processFile = async (file: File) => {
    try {
      // RESET trạng thái để sẵn sàng cho file mới
      setStatus('loading');
      setProgress(0);
      setMarkdown(""); 

      const arrayBuffer = await file.arrayBuffer();
      const result = await convertPdfToMarkdown(arrayBuffer, (current, total) => {
        setProgress(Math.round((current / total) * 100));
      });

      setMarkdown(result);
      setStatus('success');
      return { result, fileName: file.name }; // Trả về thông tin để Page xử lý lưu trữ
    } catch (error) {
      console.error("Conversion error:", error);
      setStatus('error');
      return null;
    }
  };

  return { processFile, status, progress, markdown, setMarkdown, setStatus };
};