"use client";

import { useState, useEffect } from "react";
import { Key, Plus, Trash2, ShieldCheck, AlertCircle, Save } from "lucide-react";

interface ApiKeyEntry {
    provider: string;
    key: string;
}

export default function ApiKeyManager() {
    const [apiKeys, setApiKeys] = useState<ApiKeyEntry[]>([]);
    const [newProvider, setNewProvider] = useState("");
    const [newKey, setNewKey] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Khai báo Style Neumorphism
    const neoFlat = "shadow-[5px_5px_10px_rgba(0,0,0,0.1),-5px_-5px_10px_rgba(255,255,255,0.5)]";
    const neoInset = "shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.5)]";
    const neoPressed = "active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),inset_-2px_-2px_5px_rgba(255,255,255,0.5)]";

    const loadApiKeys = async () => {
        try {
            setLoading(true);
            const root = await navigator.storage.getDirectory();
            const agentDir = await root.getDirectoryHandle("agent", { create: true });
            const fileHandle = await agentDir.getFileHandle("api-key", { create: true });
            const file = await fileHandle.getFile();
            const content = await file.text();
            
            if (content) setApiKeys(JSON.parse(content));
            setError(null);
        } catch (err) {
            setError("Hệ thống lưu trữ chưa sẵn sàng.");
        } finally {
            setLoading(false);
        }
    };

    const saveApiKeys = async (updatedKeys: ApiKeyEntry[]) => {
        try {
            const root = await navigator.storage.getDirectory();
            const agentDir = await root.getDirectoryHandle("agent", { create: true });
            const fileHandle = await agentDir.getFileHandle("api-key", { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(JSON.stringify(updatedKeys));
            await writable.close();
            setApiKeys(updatedKeys);
        } catch (err) {
            console.error("Save error:", err);
        }
    };

    const handleAddKey = () => {
        if (!newProvider || !newKey) return;
        const updated = [...apiKeys, { provider: newProvider, key: newKey }];
        saveApiKeys(updated);
        setNewProvider("");
        setNewKey("");
    };

    const handleDeleteKey = (index: number) => {
        const updated = apiKeys.filter((_, i) => i !== index);
        saveApiKeys(updated);
    };

    useEffect(() => { loadApiKeys(); }, []);

    return (
        <div className="min-h-screen bg-base-200 p-4 md:p-8 text-base-content transition-colors duration-300">
            <div className="max-w-4xl mx-auto">
                
                {/* Header */}
                <header className="mb-12 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-2xl bg-base-200 text-primary ${neoFlat}`}>
                                <Key size={24} />
                            </div>
                            <h1 className="text-3xl font-black tracking-tighter uppercase">Vault Manager</h1>
                        </div>
                        <p className="text-[10px] font-bold opacity-40 uppercase tracking-[0.3em] mt-3 ml-1">
                            Mã hóa & Lưu trữ Key cục bộ (OPFS)
                        </p>
                    </div>
                    <div className="hidden md:block">
                         <div className={`px-4 py-2 rounded-full bg-base-200 text-[10px] font-bold text-success flex items-center gap-2 ${neoInset}`}>
                            <ShieldCheck size={14} /> SECURE ENVIRONMENT
                         </div>
                    </div>
                </header>

                {/* Input Panel (Nổi) */}
                <section className={`rounded-[2.5rem] bg-base-200 p-8 mb-12 ${neoFlat}`}>
                    <h2 className="text-[10px] font-black opacity-50 uppercase tracking-widest mb-6 ml-2">Đăng ký định danh mới</h2>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        <div className="md:col-span-4">
                            <select 
                                className={`select w-full border-none bg-base-200 focus:ring-0 font-bold rounded-2xl ${neoInset}`}
                                value={newProvider}
                                onChange={(e) => setNewProvider(e.target.value)}
                            >
                                <option value="">Provider...</option>
                                <option value="OpenAI">OpenAI</option>
                                <option value="Gemini">Gemini</option>
                                <option value="Groq">Groq</option>
                                <option value="Anthropic">Anthropic</option>
                            </select>
                        </div>
                        <div className="md:col-span-6">
                            <input 
                                type="password" 
                                placeholder="sk-••••••••••••••••" 
                                className={`input w-full border-none bg-base-200 focus:ring-0 font-mono text-sm rounded-2xl ${neoInset}`}
                                value={newKey}
                                onChange={(e) => setNewKey(e.target.value)}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <button 
                                className={`btn btn-primary w-full border-none rounded-2xl shadow-none transition-all ${neoFlat} ${neoPressed}`}
                                onClick={handleAddKey}
                            >
                                <Plus size={20} />
                            </button>
                        </div>
                    </div>
                </section>

                {/* Status Alert */}
                {error && (
                    <div className={`p-4 rounded-2xl bg-base-200 border-none flex items-center gap-4 mb-8 text-warning ${neoInset}`}>
                        <AlertCircle size={20} />
                        <span className="text-xs font-bold uppercase tracking-tight">{error}</span>
                    </div>
                )}

                {/* Keys List (Các item riêng biệt) */}
                <div className="space-y-6">
                    <h2 className="text-[10px] font-black opacity-50 uppercase tracking-widest ml-2">Cơ sở dữ liệu hiện tại</h2>
                    
                    {apiKeys.length === 0 ? (
                        <div className={`p-16 rounded-[2.5rem] bg-base-200 flex flex-col items-center justify-center opacity-30 ${neoInset}`}>
                            <Save size={40} className="mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Kho lưu trữ trống</p>
                        </div>
                    ) : (
                        apiKeys.map((item, idx) => (
                            <div 
                                key={idx} 
                                className={`group rounded-3xl bg-base-200 p-5 flex flex-col md:flex-row items-center justify-between gap-4 transition-all ${neoFlat} hover:scale-[1.01]`}
                            >
                                <div className="flex items-center gap-6 w-full md:w-auto">
                                    <div className={`w-12 h-12 rounded-2xl bg-base-200 flex items-center justify-center font-black text-primary text-xs ${neoInset}`}>
                                        {item.provider.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-sm uppercase italic tracking-tight">{item.provider}</h3>
                                        <p className="font-mono text-[10px] opacity-40 mt-1">
                                            {item.key.substring(0, 12)}••••••••••••••••
                                        </p>
                                    </div>
                                </div>
                                
                                <button 
                                    className={`w-full md:w-12 h-12 rounded-2xl bg-base-200 flex items-center justify-center text-error/50 hover:text-error transition-all ${neoFlat} ${neoPressed}`}
                                    onClick={() => handleDeleteKey(idx)}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer Footer */}
                <footer className="mt-20 py-8 border-t border-base-content/5 text-center">
                    <p className="text-[8px] font-black opacity-20 uppercase tracking-[0.4em]">
                        Local-First Encryption • No Cloud Synchronization
                    </p>
                </footer>
            </div>
        </div>
    );
}