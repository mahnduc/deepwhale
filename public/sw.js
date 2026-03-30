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
    if (!opfsPath) throw new Error("Path OPFS không hợp lệ");

    const parts = opfsPath.split('/').filter(p => p);
    let currentHandle = await navigator.storage.getDirectory();
    
    for (let i = 0; i < parts.length - 1; i++) {
      currentHandle = await currentHandle.getDirectoryHandle(parts[i]);
    }

    const fileName = parts[parts.length - 1];
    const fileHandle = await currentHandle.getFileHandle(fileName);
    const file = await fileHandle.getFile();

    return new Response(file, {
      headers: {
        'Content-Type': getContentType(fileName),
        'Cache-Control': 'no-cache'
      }
    });
  } catch (e) {
    console.error("SW OPFS Error:", e);
    return new Response('File không tồn tại trong OPFS: ' + e.message, { status: 404 });
  }
}

function getContentType(fileName) {
  const ext = fileName.split('.').pop().toLowerCase();
  const map = {
    'html': 'text/html',
    'js': 'application/javascript',
    'css': 'text/css',
    'md': 'text/markdown',
    'json': 'application/json',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'svg': 'image/svg+xml',
    'txt': 'text/plain'
  };
  return map[ext] || 'application/octet-stream';
}