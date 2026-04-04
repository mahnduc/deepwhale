import * as pdfjs from 'pdfjs-dist';

// Lấy version trực tiếp từ thư viện đã cài đặt
const PDF_JS_VERSION = pdfjs.version;

if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
  // Sử dụng unpkg thường ổn định hơn cho các file mjs từ pdf.js
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${PDF_JS_VERSION}/build/pdf.worker.min.mjs`;
}

export { pdfjs };