// public/sw.js
const BASE_PATH = '/deepwhale'; // Khớp với repo name của bạn

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(clients.claim()));

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Chỉ bắt các request có định danh @opfs
  if (url.pathname.includes('/@opfs/')) {
    event.respondWith(handleOPFS(url.pathname));
  }
});

async function handleOPFS(pathname) {
  try {
    // Trích xuất path thực tế: /deepwhale/@opfs/docsify/index.html -> docsify/index.html
    const segment = '/@opfs/';
    const opfsPath = pathname.substring(pathname.indexOf(segment) + segment.length);
    
    if (!opfsPath) throw new Error("Path rỗng");

    const parts = decodeURIComponent(opfsPath).split('/').filter(Boolean);
    let currentHandle = await navigator.storage.getDirectory();

    // Duyệt cây thư mục
    for (let i = 0; i < parts.length - 1; i++) {
      currentHandle = await currentHandle.getDirectoryHandle(parts[i]);
    }

    const fileName = parts[parts.length - 1];
    const fileHandle = await currentHandle.getFileHandle(fileName);
    const file = await fileHandle.getFile();

    // Trả về Response với MIME type chuẩn để trình duyệt thực thi được JS/CSS
    return new Response(file, {
      headers: {
        'Content-Type': getMimeType(fileName),
        'Cache-Control': 'no-cache',
        'Cross-Origin-Resource-Policy': 'cross-origin'
      }
    });
  } catch (e) {
    return new Response(`[DeepWhale Error] ${e.message}`, { status: 404 });
  }
}

function getMimeType(fileName) {
  const ext = fileName.split('.').pop().toLowerCase();
  const types = {
    'html': 'text/html; charset=utf-8',
    'js': 'application/javascript; charset=utf-8',
    'css': 'text/css; charset=utf-8',
    'md': 'text/markdown; charset=utf-8',
    'json': 'application/json',
    'png': 'image/png',
    'svg': 'image/svg+xml'
  };
  return types[ext] || 'application/octet-stream';
}