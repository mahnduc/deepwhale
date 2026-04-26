"use client";

import { useState, useEffect, useCallback } from "react";
import { keyApi } from "./_api/key.api";
import { KeysSchema } from "./_services/key.service";
import { 
  Plus, 
  Trash2, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2,
  Server,
  Cpu,
  ChevronDown
} from "lucide-react";

export default function ApiKeyTool() {
  const [provider, setProvider] = useState("openai");
  const [apiKey, setApiKey] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [allKeys, setAllKeys] = useState<KeysSchema>({});
  const [isLoading, setIsLoading] = useState(false);

  const fetchKeys = useCallback(async () => {
    const data = await keyApi.getAll();
    setAllKeys(data || {});
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setMessage({ text: "REQUIRED_FIELD_MISSING", type: "error" });
      return;
    }
    setIsLoading(true);
    try {
      await keyApi.addKey(provider, apiKey);
      setMessage({ text: "ENCRYPTION_SUCCESSFUL", type: "success" });
      setApiKey("");
      await fetchKeys();
    } catch (err: any) {
      setMessage({ text: err.message || "SYSTEM_FAILURE", type: "error" });
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    }
  };

  const handleRemove = async (prov: string, key: string) => {
    if (confirm(`TERMINATE_ACCESS_FOR_${prov.toUpperCase()}?`)) {
      await keyApi.removeKey(prov, key);
      await fetchKeys();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 font-mono">
      
      {/* SECTION 1: CẤU TRÚC GIỐNG HỆT SECURITY SETTINGS */}
      <section className="border border-[#262626] p-8 relative">
        <h2 className="absolute -top-3 left-6 bg-[#000000] px-2 text-[10px] font-bold text-[#00E5FF] uppercase tracking-[0.2em]">
          Auth_Protocols
        </h2>

        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Cột trái: Mô tả (1/3) */}
            <div className="col-span-1">
              <h3 className="text-sm font-bold uppercase text-[#DCE4E5]">Update_API_Keys</h3>
              <p className="text-[10px] text-[#717B7A] uppercase mt-2 leading-relaxed">
                Inject new encryption tokens into the secure database. Select the target service provider.
              </p>
            </div>
            
            {/* Cột phải: Input (2/3) */}
            <div className="col-span-1 md:col-span-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Service Provider */}
                <div className="space-y-2">
                  <label className="text-[9px] text-[#717B7A] uppercase tracking-widest">Service_Provider</label>
                  <div className="relative">
                    <select
                      value={provider}
                      onChange={(e) => setProvider(e.target.value)}
                      className="w-full bg-black border border-[#262626] px-4 py-3 text-sm text-[#DCE4E5] focus:border-[#00E5FF] outline-none transition-all appearance-none uppercase"
                    >
                      <option value="groq">Groq</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#717B7A] pointer-events-none" />
                  </div>
                </div>

                {/* API Key */}
                <div className="space-y-2">
                  <label className="text-[9px] text-[#717B7A] uppercase tracking-widest">Entry_Token</label>
                  <input 
                    type="password" 
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-black border border-[#262626] px-4 py-3 text-sm text-[#DCE4E5] focus:border-[#00E5FF] outline-none transition-all placeholder:text-[#262626]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 pt-2">
                <button 
                  onClick={handleSave}
                  disabled={isLoading}
                  className="px-6 py-2 bg-transparent border border-[#00E5FF] text-[#00E5FF] text-[10px] font-bold uppercase tracking-widest hover:bg-[#00E5FF] hover:text-black transition-all"
                >
                  {isLoading ? "PROCESSING..." : "Update_Credentials"}
                </button>

                {message.text && (
                  <div className={`text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 ${
                    message.type === "error" ? "text-red-500" : "text-[#00E5FF]"
                  }`}>
                    {message.type === "error" ? <AlertCircle size={12} /> : <CheckCircle2 size={12} />}
                    {message.text}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border border-[#262626] p-8 relative">
        <h2 className="absolute -top-3 left-6 bg-[#000000] px-2 text-[10px] font-bold text-[#00E5FF] uppercase tracking-[0.2em]">
          Stored_Registry
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-1">
            <h3 className="text-sm font-bold uppercase text-[#DCE4E5]">Active_Nodes</h3>
            <p className="text-[10px] text-[#717B7A] uppercase mt-2 leading-relaxed">
              Overview of all currently stored and encrypted access keys in the local environment.
            </p>
          </div>

          <div className="col-span-1 md:col-span-2">
            <div className="grid grid-cols-1 gap-4">
              {Object.keys(allKeys).length === 0 ? (
                <div className="border border-[#262626] border-dashed p-8 text-center text-[#262626]">
                  <p className="text-[10px] uppercase">No_Active_Keys_Detected</p>
                </div>
              ) : (
                Object.entries(allKeys).map(([prov, keys]) => (
                  <div key={prov} className="border border-[#262626] bg-[#050505]">
                    <div className="px-4 py-2 border-b border-[#262626] flex justify-between items-center">
                      <span className="text-[10px] font-bold text-[#00E5FF] uppercase tracking-tighter flex items-center gap-2">
                        <Cpu size={10} /> {prov}
                      </span>
                      <span className="text-[9px] text-[#717B7A]">{keys.length} KEYS</span>
                    </div>
                    <div className="divide-y divide-[#1a1a1a]">
                      {keys.map((k, i) => (
                        <div key={i} className="px-4 py-3 flex justify-between items-center group hover:bg-[#00E5FF]/5">
                          <code className="text-[10px] text-[#717B7A]">{k.slice(0, 12)}...{k.slice(-4)}</code>
                          <button 
                            onClick={() => handleRemove(prov, k)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-[#717B7A] hover:text-red-500"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}