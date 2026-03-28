"use client";

import { useRouter } from "next/navigation";
import { Box, Code2, Cpu, Globe, Key } from "lucide-react";

export default function Tools() {
    const router = useRouter();

    const tools = [
        { 
            id: 1, 
            name: "MCP Server", 
            path: "mcp-server", 
            description: "Kết nối model với các công cụ bên ngoài.", 
            icon: <Cpu size={20} /> 
        },
        { 
            id: 2, 
            name: "RAG Engine", 
            path: "rag-engine", 
            description: "Truy xuất dữ liệu tăng cường cho AI.", 
            icon: <Box size={20} /> 
        },
        { 
            id: 3, 
            name: "Web Scraper", 
            path: "web-scraper", 
            description: "Trích xuất dữ liệu từ các trang web.", 
            icon: <Globe size={20} /> 
        },
        { 
            id: 4, 
            name: "Code Executor", 
            path: "code-executor", 
            description: "Chạy mã Python trực tiếp trong sandbox.", 
            icon: <Code2 size={20} /> 
        },
        { 
            id: 5, 
            name: "API Key", 
            path: "api-key-manager", 
            description: "Quản lý api key người dùng.", 
            icon: <Key size={20} /> 
        }
    ];

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-8">Danh sách Công cụ</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tools.map((tool) => (
                    <div 
                        key={tool.id} 
                        onClick={() => router.push(`/tools/${tool.path}`)}
                        className="card bg-base-200/50 hover:bg-base-300 transition-all cursor-pointer border border-base-300 group"
                    >
                        <div className="card-body gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 text-primary rounded-lg group-hover:bg-primary group-hover:text-primary-content transition-colors">
                                    {tool.icon}
                                </div>
                                <h2 className="card-title text-base">{tool.name}</h2>
                            </div>
                            
                            <p className="text-sm opacity-70 leading-relaxed">
                                {tool.description}
                            </p>

                            <div className="card-actions justify-end mt-2">
                                <div className="btn btn-ghost btn-sm text-primary uppercase tracking-wider">
                                    Config
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}