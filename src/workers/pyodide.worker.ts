import { loadPyodide, type PyodideInterface, version } from "pyodide";

let pyodide: PyodideInterface | null = null;

async function getPyodide() {
  if (pyodide) return pyodide;
  pyodide = await loadPyodide({
    indexURL: `https://cdn.jsdelivr.net/pyodide/v${version}/full/`,
  });
  return pyodide;
}

/**
 * Hàm nạp các file script từ thư mục public/scripts vào VFS của Pyodide
 */
async function syncScriptsToVFS(py: PyodideInterface) {
  const scripts = ["main.py"]; // Danh sách file bạn muốn nạp
  const VFS_PATH = "/app";

  // 1. Tạo thư mục làm việc trong hệ thống tệp ảo
  if (!py.FS.analyzePath(VFS_PATH).exists) {
    py.FS.mkdir(VFS_PATH);
  }

  // 2. Fetch và ghi từng file vào VFS
  for (const fileName of scripts) {
    try {
      const response = await fetch(`/scripts/${fileName}`);
      if (!response.ok) throw new Error(`Không tìm thấy file ${fileName} tại public/scripts/`);
      
      const content = await response.text();
      
      // Ghi file vào bộ nhớ ảo
      py.FS.writeFile(`${VFS_PATH}/${fileName}`, content);
      console.log(`[VFS] Đã nạp: ${VFS_PATH}/${fileName}`);
    } catch (err) {
      console.error(`[VFS] Lỗi khi nạp ${fileName}:`, err);
    }
  }

  // 3. Thêm đường dẫn ảo vào sys.path của Python để có thể import
  py.runPython(`
import sys
if "${VFS_PATH}" not in sys.path:
    sys.path.append("${VFS_PATH}")
  `);
}

self.onmessage = async (event: MessageEvent) => {
  const { inputs } = event.data; // Không cần truyền 'code' cứng từ UI nữa
  const py = await getPyodide();

  try {
    // Đồng bộ hệ thống tệp ảo trước khi chạy
    await syncScriptsToVFS(py);

    // Inject dữ liệu đầu vào
    py.globals.set("raw_input", JSON.stringify(inputs));
    
    // Chạy mã bằng cách đọc trực tiếp file từ VFS
    // Chúng ta dùng exec() để thực thi nội dung file main.py
    const result = await py.runPythonAsync(`
with open('/app/main.py', 'r') as f:
    script_content = f.read()
    # Thực thi script và trả về kết quả cuối cùng (nếu có)
    exec(script_content)
    # Nếu main.py định nghĩa biến 'response', ta lấy nó ra
    response if 'response' in locals() else "Script executed successfully"
    `);

    self.postMessage({ type: "SUCCESS", result });
  } catch (error: any) {
    self.postMessage({ type: "ERROR", error: error.message });
  }
};