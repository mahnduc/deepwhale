"use client";

import { useState, useEffect } from "react";
import { Key, Plus, Trash2, FolderClosed, Save } from "lucide-react";

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

    const FILE_PATH = "agent/api-key";

    // 1. Xử lý đọc dữ liệu từ OPFS
    const loadApiKeys = async () => {
        try {
            setLoading(true);
            const root = await navigator.storage.getDirectory();
            
            // Truy cập thư mục 'agent'
            let agentDir;
            try {
                agentDir = await root.getDirectoryHandle("agent");
            } catch {
                setError("Folder 'agent' chưa tồn tại");
                setLoading(false);
                return;
            }

            // Truy cập file 'api-key'
            const fileHandle = await agentDir.getFileHandle("api-key");
            const file = await fileHandle.getFile();
            const content = await file.text();
            
            if (content) {
                setApiKeys(JSON.parse(content));
            }
            setError(null);
        } catch (err) {
            console.error("Error loading keys:", err);
            setError("File 'api-key' chưa tồn tại hoặc bị lỗi.");
        } finally {
            setLoading(false);
        }
    };

    // 2. Xử lý lưu dữ liệu vào OPFS
    const saveApiKeys = async (updatedKeys: ApiKeyEntry[]) => {
        try {
            const root = await navigator.storage.getDirectory();
            const agentDir = await root.getDirectoryHandle("agent", { create: true });
            const fileHandle = await agentDir.getFileHandle("api-key", { create: true });
            
            // @ts-ignore - FileSystemWritableFileStream có thể chưa có type hoàn chỉnh
            const writable = await fileHandle.createWritable();
            await writable.write(JSON.stringify(updatedKeys));
            await writable.close();
            
            setApiKeys(updatedKeys);
            setError(null);
        } catch (err) {
            console.error("Error saving keys:", err);
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

    useEffect(() => {
        loadApiKeys();
    }, []);

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
                <Key className="text-primary" />
                <h1 className="text-2xl font-bold">API Key Configuration</h1>
            </div>

            {/* Giao diện nhập liệu */}
            <div className="card bg-base-200/50 border border-base-300 mb-8">
                <div className="card-body p-6">
                    <h2 className="card-title text-sm uppercase opacity-60 mb-4">Thêm Key mới</h2>
                    <div className="flex flex-col md:flex-row gap-4">
                        <select 
                            className="select select-bordered flex-1"
                            value={newProvider}
                            onChange={(e) => setNewProvider(e.target.value)}
                        >
                            <option value="">Chọn Provider</option>
                            <option value="OpenAI">OpenAI</option>
                            <option value="Gemini">Gemini</option>
                            <option value="Groq">Groq</option>
                            <option value="Anthropic">Anthropic</option>
                        </select>
                        <input 
                            type="password" 
                            placeholder="Nhập API Key..." 
                            className="input input-bordered flex-[2]"
                            value={newKey}
                            onChange={(e) => setNewKey(e.target.value)}
                        />
                        <button className="btn btn-primary" onClick={handleAddKey}>
                            <Plus size={20} /> Thêm
                        </button>
                    </div>
                </div>
            </div>

            {/* Hiển thị lỗi/Trạng thái folder */}
            {error && (
                <div className="alert alert-warning mb-6 shadow-sm">
                    <FolderClosed size={20} />
                    <span>{error}</span>
                    <button className="btn btn-sm btn-ghost" onClick={() => saveApiKeys([])}>Tạo ngay</button>
                </div>
            )}

            {/* Danh sách Key */}
            <div className="overflow-x-auto">
                <table className="table bg-base-100 rounded-xl overflow-hidden shadow-sm border border-base-300">
                    <thead className="bg-base-200">
                        <tr>
                            <th>Provider</th>
                            <th>API Key</th>
                            <th className="text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {apiKeys.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="text-center py-8 opacity-50">Chưa có API Key nào được lưu.</td>
                            </tr>
                        ) : (
                            apiKeys.map((item, idx) => (
                                <tr key={idx} className="hover">
                                    <td className="font-semibold">{item.provider}</td>
                                    <td className="font-mono text-xs opacity-60">
                                        {item.key.substring(0, 8)}****************
                                    </td>
                                    <td className="text-right">
                                        <button 
                                            className="btn btn-ghost btn-xs text-error"
                                            onClick={() => handleDeleteKey(idx)}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}