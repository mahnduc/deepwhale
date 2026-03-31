'use client';
import { useState, useEffect, useRef } from 'react';

export default function PythonToolbox() {
  const [inputs, setInputs] = useState({ name: '', age: '' });
  const [output, setOutput] = useState<any>(null); // Để any để nhận cả Object
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // Khởi tạo worker
    workerRef.current = new Worker(new URL('../../../workers/pyodide.worker.ts', import.meta.url));
    
    workerRef.current.onmessage = (e) => {
      const { type, result, error } = e.data;
      if (type === "SUCCESS") {
        setOutput(result);
        setStatus('idle');
      } else {
        setOutput(error);
        setStatus('error');
      }
    };

    return () => workerRef.current?.terminate();
  }, []);

  const runProcess = () => {
    if (!inputs.name || !inputs.age) {
        alert("Vui lòng nhập đầy đủ thông tin");
        return;
    }
    setStatus('loading');
    setOutput(null);
    workerRef.current?.postMessage({ inputs });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8 border border-gray-100">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">Py</div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Python Local Engine</h1>
        </div>

        {/* --- KHỐI NHẬP LIỆU --- */}
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Tên người dùng</label>
              <input
                placeholder="Ví dụ: Vương Mạnh Đức"
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                onChange={(e) => setInputs({ ...inputs, name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Tuổi</label>
              <input
                type="number"
                placeholder="22"
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                onChange={(e) => setInputs({ ...inputs, age: e.target.value })}
              />
            </div>
          </div>

          <button
            onClick={runProcess}
            disabled={status === 'loading'}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all shadow-lg active:scale-[0.98] ${
              status === 'loading' 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
            }`}
          >
            {status === 'loading' ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang tính toán trong Browser...
              </span>
            ) : 'Thực thi Python Script'}
          </button>
        </div>

        {/* --- KHỐI OUTPUT (TERMINAL) --- */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Output Console</span>
            {status === 'idle' && output && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Thành công</span>
            )}
          </div>
          <div className={`p-5 rounded-xl font-mono text-sm min-h-37.5 transition-all overflow-auto border-2 ${
            status === 'error' 
            ? 'bg-red-50 border-red-100 text-red-600' 
            : 'bg-slate-900 border-slate-800 text-green-400 shadow-inner'
          }`}>
            {output ? (
                typeof output === 'object' ? (
                    <pre>{JSON.stringify(output, null, 2)}</pre>
                ) : (
                    <p>{output}</p>
                )
            ) : (
              <p className="text-slate-500 animate-pulse">Đang chờ lệnh từ bạn...</p>
            )}
          </div>
        </div>

        <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
                Chạy hoàn toàn bằng WebAssembly & Pyodide. Dữ liệu không rời khỏi trình duyệt.
            </p>
        </div>
      </div>
    </div>
  );
}