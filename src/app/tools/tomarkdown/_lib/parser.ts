// src/app/tools/tomarkdown/_lib/parser.ts
import TurndownService from 'turndown';

const turndownService = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
});

export const convertPdfToMarkdown = async (
  fileArrayBuffer: ArrayBuffer, 
  onProgress?: (page: number, total: number) => void
): Promise<string> => {
  
  // CHỐT CHẶN: Chỉ import pdfjs-dist khi đang ở môi trường trình duyệt
  if (typeof window === 'undefined') return "";

  // Dynamic import để tránh lỗi DOMMatrix trên Server
  const pdfjs = await import('pdfjs-dist');
  
  // Cấu hình worker bằng CDN đồng bộ version
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

  const loadingTask = pdfjs.getDocument({ data: fileArrayBuffer });
  const pdf = await loadingTask.promise;
  let fullMarkdown = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');

    fullMarkdown += `## Trang ${i}\n\n${pageText}\n\n---\n\n`;

    if (onProgress) onProgress(i, pdf.numPages);
  }

  return fullMarkdown;
};