'use client';
import { useState, useEffect, useRef } from 'react';
import { Play, Terminal, Cpu, Info } from 'lucide-react';

export default function PythonToolbox() {
  const [inputs, setInputs] = useState({ name: '', age: '' });
  const [output, setOutput] = useState<any>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const workerRef = useRef<Worker | null>(null);

  // ĐỒNG BỘ HỆ THỐNG SHADOW
  const neoFlat = "shadow-[5px_5px_10px_rgba(0,0,0,0.1),-5px_-5px_10px_rgba(255,255,255,0.5)]";
  const neoInset = "shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.5)]";
  const neoPressed = "active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),inset_-2px_-2px_5px_rgba(255,255,255,0.5)] active:scale-[0.98]";

  useEffect(() => {
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
    <div className="min-h-screen bg-base-200 py-12 px-4 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        
        {/* HEADER */}
        <header className="mb-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">
              Python <span className="text-primary">Engine</span>
            </h1>
            <p className="text-[10px] font-bold opacity-40 uppercase tracking-[0.3em] mt-2">
              Thực thi WebAssembly local
            </p>
          </div>
          <div className={`p-4 rounded-2xl bg-base-200 text-primary ${neoFlat}`}>
            <Cpu size={24} />
          </div>
        </header>

        {/* MAIN CONTAINER */}
        <div className={`rounded-[3rem] bg-base-200 p-10 ${neoFlat} space-y-10`}>
          
          {/* INPUT SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-2">Tên người dùng</label>
              <input
                placeholder="Nhập tên..."
                className={`w-full bg-base-200 p-4 rounded-2xl outline-none border-none font-bold text-sm transition-all ${neoInset} focus:text-primary`}
                onChange={(e) => setInputs({ ...inputs, name: e.target.value })}
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-2">Tuổi</label>
              <input
                type="number"
                placeholder="22"
                className={`w-full bg-base-200 p-4 rounded-2xl outline-none border-none font-bold text-sm transition-all ${neoInset} focus:text-primary`}
                onChange={(e) => setInputs({ ...inputs, age: e.target.value })}
              />
            </div>
          </div>

          {/* RUN BUTTON */}
          <button
            onClick={runProcess}
            disabled={status === 'loading'}
            className={`w-full py-5 rounded-[1.5rem] bg-base-200 font-black text-[11px] tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-3 ${
              status === 'loading' 
              ? 'text-base-content/20 ' + neoInset 
              : 'text-primary ' + neoFlat + ' ' + neoPressed
            }`}
          >
            {status === 'loading' ? (
              <>
                <span className="loading loading-spinner loading-xs"></span>
                Đang xử lý...
              </>
            ) : (
              <>
                <Play size={16} fill="currentColor" />
                Thực thi Python Script
              </>
            )}
          </button>

          {/* OUTPUT CONSOLE */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <Terminal size={14} className="opacity-40" />
                <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">Output Console</span>
              </div>
              {status === 'error' && <span className="text-[8px] font-black text-error uppercase tracking-tighter">Lỗi thực thi</span>}
            </div>

            <div className={`p-8 rounded-[2.5rem] bg-base-200 min-h-[150px] transition-all overflow-auto ${neoInset}`}>
              {output ? (
                <div className={`font-mono text-sm leading-relaxed ${status === 'error' ? 'text-error' : 'text-primary'}`}>
                   {typeof output === 'object' ? (
                      <pre className="whitespace-pre-wrap">{JSON.stringify(output, null, 2)}</pre>
                    ) : (
                      <p>{output}</p>
                    )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full opacity-20 italic text-sm">
                  <p className="animate-pulse">Đang chờ lệnh từ bạn...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}