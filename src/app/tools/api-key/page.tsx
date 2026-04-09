"use client";

import { useState } from "react";
import { AlertCircle, Menu } from "lucide-react";
import { useApiKey } from "./_hooks/useApiKey";
import { ApiKeyHeader } from "./_components/ApiKeyHeader";
import { ApiKeyForm } from "./_components/ApiKeyForm";
import { ApiKeyList } from "./_components/ApiKeyList";
import { ApiKeyMonitor } from "./_components/ApiKeyMonitor";

export default function ApiKeyManager() {
    const { 
        apiKeys, 
        models, 
        monitoringKey, 
        error, 
        isFetchingModels, 
        addKey, 
        deleteKey, 
        monitorKey 
    } = useApiKey();

    const [newProvider, setNewProvider] = useState("");
    const [newKey, setNewKey] = useState("");

    const handleAdd = async () => {
        await addKey(newProvider, newKey);
        setNewProvider("");
        setNewKey("");
    };

    return (
        /* MAIN CONTENT AREA: Cấu trúc theo yêu cầu thiết kế Web-Base App */
        <main className="flex-1 min-w-0 h-full relative flex flex-col">
            {/* Mobile Menu Trigger - Chỉ hiện trên mobile */}
            <button 
                className="lg:hidden fixed bottom-6 right-6 z-50 w-12 h-12 bg-[var(--color-brand-primary)] text-white rounded-full shadow-lg flex items-center justify-center active:scale-90 transition-transform"
            >
                <Menu size={24} />
            </button>

            {/* Viewport chính */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar bg-[var(--color-ui-bg)]">
                <div className="w-full h-full min-h-full p-4 md:p-8 lg:p-12">
                    <div className="max-w-4xl mx-auto space-y-8">
                        
                        {/* Header Section */}
                        <header className="space-y-2">
                            <ApiKeyHeader />
                        </header>

                        {/* Error Alert - Styled with Semantic Tokens */}
                        {error && (
                            <div className="flex items-center gap-3 p-4 bg-[var(--color-state-error)]/10 border border-[var(--color-state-error)]/20 text-[var(--color-state-error)] rounded-lg">
                                <AlertCircle size={18} />
                                <p className="font-medium !mb-0 text-xs">{error}</p>
                            </div>
                        )}

                        {/* Control Section: Form & List */}
                        <section className="grid gap-6">
                            <div className="ui-card">
                                <h6>Registration</h6>
                                <ApiKeyForm 
                                    newProvider={newProvider} 
                                    newKey={newKey} 
                                    setNewProvider={setNewProvider} 
                                    setNewKey={setNewKey} 
                                    onAdd={handleAdd} 
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-1">
                                    <h3>Active Credentials</h3>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-ui-border)] text-[var(--color-ui-text-muted)] uppercase">
                                        {apiKeys.length} Keys
                                    </span>
                                </div>
                                <ApiKeyList 
                                    apiKeys={apiKeys} 
                                    onDelete={deleteKey} 
                                    onMonitor={monitorKey} 
                                />
                            </div>
                        </section>

                        {/* Monitoring Section - Floating or Bottom Card */}
                        {monitoringKey && (
                            <section className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <div className="ui-card border-t-2 border-t-[var(--color-brand-primary)] shadow-xl">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-2 h-2 rounded-full bg-[var(--color-brand-primary)] animate-pulse" />
                                        <h6>Real-time Monitoring</h6>
                                    </div>
                                    <ApiKeyMonitor 
                                        monitoringKey={monitoringKey} 
                                        models={models} 
                                        isFetching={isFetchingModels} 
                                    />
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}