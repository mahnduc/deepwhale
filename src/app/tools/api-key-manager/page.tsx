"use client";

import { useState, useEffect } from "react";
import { Key, Plus, Trash2, ShieldCheck, AlertCircle, Save, MonitorCog, Activity, Cpu, Box } from "lucide-react";

interface ApiKeyEntry {
    provider: string;
    key: string;
}

interface GroqModel {
    id: string;
    owned_by: string;
    active: boolean;
}

export default function ApiKeyManager() {
    const [apiKeys, setApiKeys] = useState<ApiKeyEntry[]>([]);
    const [newProvider, setNewProvider] = useState("");
    const [newKey, setNewKey] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // State cho việc Monitor
    const [monitoringKey, setMonitoringKey] = useState<ApiKeyEntry | null>(null);
    const [models, setModels] = useState<GroqModel[]>([]);
    const [isFetchingModels, setIsFetchingModels] = useState(false);

    const neoFlat = "shadow-[5px_5px_10px_rgba(0,0,0,0.1),-5px_-5px_10px_rgba(255,255,255,0.5)]";
    const neoInset = "shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.5)]";
    const neoPressed = "active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),inset_-2px_-2px_5px_rgba(255,255,255,0.5)]";

    const loadApiKeys = async () => {
        try {
            setLoading(true);
            const root = await navigator.storage.getDirectory();
            const agentDir = await root.getDirectoryHandle("agents", { create: true });
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
            const agentDir = await root.getDirectoryHandle("agents", { create: true });
            const fileHandle = await agentDir.getFileHandle("api-key", { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(JSON.stringify(updatedKeys));
            await writable.close();
            setApiKeys(updatedKeys);
        } catch (err) {
            console.error("Save error:", err);
        }
    };

    const fetchGroqModels = async (apiKey: string) => {
        setIsFetchingModels(true);
        setModels([]);
        try {
            const response = await fetch("https://api.groq.com/openai/v1/models", {
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                }
            });
            const data = await response.json();
            if (data.data) {
                setModels(data.data);
            } else {
                setError("Không thể lấy danh sách model. Kiểm tra lại Key.");
            }
        } catch (err) {
            setError("Lỗi kết nối đến API Groq.");
        } finally {
            setIsFetchingModels(false);
        }
    };

    const handleMonitor = (item: ApiKeyEntry) => {
        if (item.provider !== "Groq") {
            alert("Tính năng Monitor hiện chỉ hỗ trợ Groq");
            return;
        }
        setMonitoringKey(item);
        fetchGroqModels(item.key);
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
        if (monitoringKey === apiKeys[index]) setMonitoringKey(null);
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
                            <h1 className="text-3xl font-black tracking-tighter uppercase">QUẢN LÝ API KEY</h1>
                        </div>
                        <p className="text-[10px] font-bold opacity-40 uppercase tracking-[0.3em] mt-3 ml-1">Mã hóa cục bộ (OPFS)</p>
                    </div>
                    <div className={`hidden md:flex px-4 py-2 rounded-full bg-base-200 text-[10px] font-bold text-success items-center gap-2 ${neoInset}`}>
                        <ShieldCheck size={14} /> SECURE ENVIRONMENT
                    </div>
                </header>

                {/* Input Panel */}
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
                                <option value="Gemini">Gemini</option>
                                <option value="Groq">Groq</option>
                            </select>
                        </div>
                        <div className="md:col-span-6">
                            <input 
                                type="password" 
                                placeholder="gsk-••••••••••••••••" 
                                className={`input w-full border-none bg-base-200 focus:ring-0 font-mono text-sm rounded-2xl ${neoInset}`}
                                value={newKey}
                                onChange={(e) => setNewKey(e.target.value)}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <button className={`btn btn-primary w-full border-none rounded-2xl shadow-none transition-all ${neoFlat} ${neoPressed}`} onClick={handleAddKey}>
                                <Plus size={20} />
                            </button>
                        </div>
                    </div>
                </section>

                {/* Keys List */}
                <div className="space-y-6 mb-12">
                    <h2 className="text-[10px] font-black opacity-50 uppercase tracking-widest ml-2">Danh sách API Key</h2>
                    {apiKeys.map((item, idx) => (
                        <div key={idx} className={`group rounded-3xl bg-base-200 p-5 flex flex-col md:flex-row items-center justify-between gap-4 transition-all ${neoFlat} hover:scale-[1.01]`}>
                            <div className="flex items-center gap-6 w-full md:w-auto">
                                <div className={`w-12 h-12 rounded-2xl bg-base-200 flex items-center justify-center font-black text-primary text-xs ${neoInset}`}>
                                    {item.provider.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-black text-sm uppercase italic tracking-tight">{item.provider}</h3>
                                    <p className="font-mono text-[10px] opacity-40 mt-1">{item.key.substring(0, 12)}••••</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button 
                                    className={`w-12 h-12 rounded-2xl bg-base-200 flex items-center justify-center transition-all ${monitoringKey?.key === item.key ? neoInset + " text-primary" : neoFlat + " text-base-content/50"} ${neoPressed}`}
                                    onClick={() => handleMonitor(item)}
                                >
                                    <MonitorCog size={18} />
                                </button>
                                <button className={`w-12 h-12 rounded-2xl bg-base-200 flex items-center justify-center text-error/50 hover:text-error transition-all ${neoFlat} ${neoPressed}`} onClick={() => handleDeleteKey(idx)}>
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Monitoring Details Section */}
                {monitoringKey && (
                    <section className={`rounded-[2.5rem] bg-base-200 p-8 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 ${neoInset}`}>
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl bg-base-200 text-primary ${neoFlat}`}>
                                    <Activity size={18} />
                                </div>
                                <h2 className="text-sm font-black uppercase tracking-tighter">Hệ thống giám sát: {monitoringKey.provider}</h2>
                            </div>
                            <button onClick={() => setMonitoringKey(null)} className="text-[10px] font-bold opacity-50 hover:opacity-100 uppercase">Đóng</button>
                        </div>

                        {isFetchingModels ? (
                            <div className="flex flex-col items-center py-10 opacity-40">
                                <div className="loading loading-ring loading-lg mb-2"></div>
                                <p className="text-[10px] font-bold uppercase tracking-widest">Đang truy vấn model...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Model List */}
                                <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                    <p className="text-[10px] font-black opacity-40 uppercase mb-2 flex items-center gap-2">
                                        <Cpu size={12} /> Available Models ({models.length})
                                    </p>
                                    {models.map((m) => (
                                        <div key={m.id} className={`p-3 rounded-xl bg-base-200 text-xs font-mono flex items-center justify-between border border-base-content/5 ${neoFlat}`}>
                                            <span className="font-bold text-primary">{m.id}</span>
                                            <span className="text-[9px] opacity-40 uppercase">{m.owned_by}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Usage / Info Panel */}
                                <div className={`p-6 rounded-3xl bg-base-200 flex flex-col justify-center items-center text-center ${neoFlat}`}>
                                    <Box size={32} className="mb-4 text-primary opacity-20" />
                                    <h4 className="text-xs font-black uppercase mb-1">Kiểm tra giới hạn (Rate Limits)</h4>
                                    <p className="text-[10px] opacity-50 mb-4 px-4 leading-relaxed">
                                        API của Groq hiện tại không cung cấp endpoint trực tiếp cho mức sử dụng token theo thời gian thực qua REST. 
                                    </p>
                                    <div className="w-full space-y-2">
                                        <div className="flex justify-between text-[9px] font-black uppercase px-2">
                                            <span>Trạng thái Key</span>
                                            <span className="text-success tracking-widest">Active</span>
                                        </div>
                                        <div className={`h-2 w-full rounded-full bg-base-200 ${neoInset}`}>
                                            <div className="h-full w-full bg-success rounded-full opacity-50 shadow-[0_0_10px_rgba(0,255,0,0.3)]"></div>
                                        </div>
                                    </div>
                                    <button className="btn btn-xs btn-ghost mt-6 text-[9px] tracking-widest uppercase opacity-40">Refresh Data</button>
                                </div>
                            </div>
                        )}
                    </section>
                )}

                {/* Footer */}
                <footer className="mt-20 py-8 border-t border-base-content/5 text-center">
                    <p className="text-[8px] font-black opacity-20 uppercase tracking-[0.4em]">Local-First Encryption • Deep Whale Protocol</p>
                </footer>
            </div>
        </div>
    );
}