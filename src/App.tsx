import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

interface McpResponse {
  result?: {
    content?: Array<{ type: string; text: string }>;
    isError?: boolean;
  };
  error?: {
    code: number;
    message: string;
  };
}

function App() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const closeSplash = async () => {
      try {
        setTimeout(async () => {
          await invoke("close_splashscreen");
        }, 500);
      } catch (err) {
        console.error("Lỗi khi đóng splashscreen:", err);
      }
    };

    closeSplash();
  }, []); 

  const callMcpTool = async () => {
    if (!input.trim() || isLoading) return;
    setIsLoading(true);
    setResult("");

    try {
      const response = await invoke<McpResponse>("call_mcp", {
        method: "tools/call",
        params: { name: "say_hello", arguments: { name: input } },
      });

      if (response.error) {
        setResult(`Error: ${response.error.message}`);
      } else if (response.result?.content?.[0]) {
        setResult(response.result.content[0].text);
      } else {
        setResult("No content returned.");
      }
    } catch (err) {
      setResult(`System Error: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-fluent-bg dark:bg-[#202020] text-[#1b1b1b] dark:text-fluent-card font-sans p-6 selection:bg-fluent-blue/30 overflow-y-auto no-scrollbar">
      <header className="w-full max-w-2xl mx-auto mb-8">
        <h1 className="text-2xl font-semibold tracking-normal leading-tight">MCP Bridge</h1>
        <div className="h-1 w-8 bg-fluent-blue mt-1 rounded-full" />
      </header>

      <main className="w-full max-w-2xl mx-auto space-y-6">
        <section className="bg-fluent-card/80 dark:bg-[#2b2b2b]/80 backdrop-blur-md border border-[#e5e5e5] dark:border-[#3a3a3a] rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.04)] p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-normal text-[#616161] dark:text-[#adadad]">
                User Identity
              </label>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && callMcpTool()}
                placeholder="e.g. [your name]"
                className="w-full px-3 py-2 bg-white dark:bg-[#323232] border-b-2 border-[#8a8a8a] focus:border-fluent-blue outline-none transition-colors duration-150 text-sm rounded-t"
                disabled={isLoading}
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={callMcpTool}
                disabled={isLoading || !input}
                className="px-6 py-1.5 bg-[#0078d4] hover:bg-[#106ebe] active:bg-[#005a9e] disabled:bg-[#cccccc] dark:disabled:bg-[#333333] text-white text-sm font-medium rounded transition-all shadow-[0_2px_4px_rgba(0,120,212,0.2)]"
              >
                {isLoading ? "Executing..." : "Invoke Tool"}
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <label className="text-xs font-semibold text-[#616161] dark:text-[#adadad] ml-1 uppercase tracking-wider">
            Output Terminal
          </label>
          <div className="bg-[#fafafa] dark:bg-[#1a1a1a] border border-[#e5e5e5] dark:border-[#333333] rounded-lg overflow-hidden transition-all">
            <div className="flex items-center gap-2 px-4 py-2 bg-[#f0f0f0] dark:bg-[#252525] border-b border-[#e5e5e5] dark:border-[#333333]">
              <div className="w-2.5 h-2.5 rounded-full bg-[#76ff7d]/20 border border-[#28ea31]" />
              <span className="text-[10px] text-[#616161] dark:text-[#adadad] font-mono">STDOUT</span>
            </div>
            <div className="p-4 min-h-[150px] font-mono text-sm leading-relaxed">
              {result ? (
                <div className="animate-in fade-in slide-in-from-top-1 duration-300">
                  <span className="text-[#0078d4] mr-2">»</span>
                  {result}
                </div>
              ) : (
                <span className="text-[#a1a1a1] animate-pulse">Waiting for input...</span>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="fixed bottom-0 left-0 w-full bg-[#f9f9f9]/90 dark:bg-[#2c2c2c]/90 backdrop-blur-lg border-t border-[#e5e5e5] dark:border-[#3a3a3a] px-4 py-1 flex items-center justify-between text-[11px] text-[#616161] dark:text-[#adadad]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#107c10]" />
            <span>Connected: FastMCP</span>
          </div>
          <div className="h-3 w-px bg-[#d1d1d1] dark:bg-[#444444]" />
          <span>v0.1.0-hello world</span>
        </div>
        <div className="font-mono uppercase tracking-tighter italic">
          Fluent UI Color System
        </div>
      </footer>
    </div>
  );
}

export default App;