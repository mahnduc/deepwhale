self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(clients.claim()));

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (url.pathname.includes('/@opfs/')) {
    event.respondWith(handleOPFSRequest(url.pathname));
  }
});

async function handleOPFSRequest(pathname) {
  try {
    const opfsPath = pathname.split('/@opfs/')[1];
    if (!opfsPath) throw new Error("Path không hợp lệ");

    const decodedPath = decodeURIComponent(opfsPath);
    const parts = decodedPath.split('/').filter(p => p);
    
    let currentHandle = await navigator.storage.getDirectory();
    
    // Duyệt qua các thư mục cha
    for (let i = 0; i < parts.length - 1; i++) {
      currentHandle = await currentHandle.getDirectoryHandle(parts[i], { create: false });
    }

    // Lấy file handle cuối cùng
    const fileName = parts[parts.length - 1];
    const fileHandle = await currentHandle.getFileHandle(fileName);
    const file = await fileHandle.getFile();

    // Tạo Header phản hồi
    const responseHeaders = new Headers({
      'Content-Type': getContentType(fileName),
      'Cache-Control': 'no-cache',
      'Cross-Origin-Resource-Policy': 'cross-origin'
    });

    return new Response(file, {
      status: 200,
      headers: responseHeaders
    });
  } catch (e) {
    console.warn("SW OPFS 404:", pathname, e.message);
    return new Response(`[DeepWhale SW] File not found: ${e.message}`, { 
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}

function getContentType(fileName) {
  const ext = fileName.split('.').pop().toLowerCase();
  const map = {
    'html': 'text/html; charset=utf-8',
    'js': 'application/javascript; charset=utf-8',
    'css': 'text/css; charset=utf-8',
    'md': 'text/markdown; charset=utf-8',
    'json': 'application/json',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'wasm': 'application/wasm',
    'pdf': 'application/pdf'
  };
  return map[ext] || 'application/octet-stream';
}