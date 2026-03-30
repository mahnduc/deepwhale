"use client";

import { useRouter } from "next/navigation";
import { Box, Code2, Cpu, Globe, Key, ChevronRight } from "lucide-react";

export default function Tools() {
    const router = useRouter();

    const neoFlat = "shadow-[5px_5px_10px_rgba(0,0,0,0.1),-5px_-5px_10px_rgba(255,255,255,0.5)]";
    const neoInset = "shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.5)]";
    const neoPressed = "active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),inset_-2px_-2px_5px_rgba(255,255,255,0.5)]";

    const tools = [
        { 
            id: 1, 
            name: "MCP Server", 
            path: "mcp-server", 
            description: "Kết nối model với các công cụ bên ngoài.", 
            icon: <Cpu size={22} /> 
        },
        { 
            id: 2, 
            name: "RAG Engine", 
            path: "rag-engine", 
            description: "Truy xuất dữ liệu tăng cường cho AI.", 
            icon: <Box size={22} /> 
        },
        { 
            id: 3, 
            name: "Web Scraper", 
            path: "web-scraper", 
            description: "Trích xuất dữ liệu từ các trang web.", 
            icon: <Globe size={22} /> 
        },
        { 
            id: 4, 
            name: "Code Executor", 
            path: "code-executor", 
            description: "Chạy mã Python trực tiếp trong sandbox.", 
            icon: <Code2 size={22} /> 
        },
        { 
            id: 5, 
            name: "API Key", 
            path: "api-key-manager", 
            description: "Quản lý api key người dùng.", 
            icon: <Key size={22} /> 
        }
    ];

    return (
        <div className="min-h-screen bg-base-200 p-8 text-base-content transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                
                <header className="mb-12">
                    <h1 className="text-4xl font-black tracking-tighter uppercase">Hệ thống Công cụ</h1>
                    <p className="text-[10px] font-bold opacity-40 uppercase tracking-[0.3em] mt-2">
                        Giao thức mở rộng năng lực thực thể
                    </p>
                </header>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 ">
                    {tools.map((tool) => (
                        <div 
                            key={tool.id} 
                            onClick={() => router.push(`/tools/${tool.path}`)}
                            className={`group relative rounded-[2.5rem] bg-base-200 p-8 transition-all duration-300 cursor-pointer ${neoFlat} hover:scale-[1.02] ${neoPressed}`}
                        >
                            <div className="flex flex-col h-full">
                                <div className={`w-14 h-14 rounded-2xl bg-base-200 flex items-center justify-center text-primary mb-6 transition-transform group-hover:scale-110 ${neoInset}`}>
                                    {tool.icon}
                                </div>

                                <div className="grow">
                                    <h2 className="text-xl font-black tracking-tight mb-2 uppercase italic">
                                        {tool.name}
                                    </h2>
                                    <p className="text-xs opacity-60 leading-relaxed font-medium">
                                        {tool.description}
                                    </p>
                                </div>

                                <div className="mt-8 flex justify-between items-center">
                                    <span className="text-[9px] font-bold opacity-30 tracking-widest uppercase">
                                        Active Protocol
                                    </span>
                                    <div className={`p-2 rounded-full bg-base-200 text-primary transition-all ${neoFlat}`}>
                                        <ChevronRight size={16} />
                                    </div>
                                </div>
                            </div>

                            <div className="absolute top-6 right-8 flex items-center gap-1.5">
                                <span className="text-[8px] font-bold opacity-20 uppercase tracking-tighter">Status</span>
                                <div className="w-1.5 h-1.5 rounded-full bg-success shadow-[0_0_8px_rgba(52,211,153,0.5)] animate-pulse"></div>
                            </div>
                        </div>
                    ))}

                    {/* Placeholder Card (Trống) */}
                    <div className={`rounded-[2.5rem] bg-base-200 p-8 border-2 border-dashed border-base-content/5 flex flex-col items-center justify-center opacity-30`}>
                        <div className="w-12 h-12 rounded-full flex items-center justify-center border-2 border-dashed border-current mb-4">
                            <span className="text-2xl font-light">+</span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest">More Tools Soon</span>
                    </div>
                </div>

            </div>
        </div>
    );
}