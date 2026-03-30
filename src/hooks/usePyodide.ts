import { useEffect, useRef, useState } from 'react';

export function usePyodide() {
  const workerRef = useRef<Worker | null>(null);
  const [output, setOutput] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Khởi tạo worker mới
    workerRef.current = new Worker(new URL('../workers/pyodide.worker.ts', import.meta.url));

    workerRef.current.onmessage = (event) => {
      const { result, error } = event.data;
      if (error) console.error("Python Error:", error);
      setOutput(result);
      setLoading(false);
    };

    return () => workerRef.current?.terminate();
  }, []);

  const runPython = (code: string) => {
    setLoading(true);
    workerRef.current?.postMessage({ code });
  };

  return { runPython, output, loading };
}