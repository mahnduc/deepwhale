"use client";

import { useState } from "react";
import { useApiKey } from "./_hooks/useApiKey";
import { ApiKeyHeader } from "./_components/ApiKeyHeader";
import { ApiKeyForm } from "./_components/ApiKeyForm";
import { ApiKeyList } from "./_components/ApiKeyList";
import { ApiKeyMonitor } from "./_components/ApiKeyMonitor";

export default function ApiKeyManager() {
    const { apiKeys, models, monitoringKey, error, isFetchingModels, addKey, deleteKey, monitorKey } = useApiKey();
    const [newProvider, setNewProvider] = useState("");
    const [newKey, setNewKey] = useState("");

    const handleAdd = async () => {
        await addKey(newProvider, newKey);
        setNewProvider("");
        setNewKey("");
    };

    return (
        <div className="min-h-screen bg-base-200 p-4 md:p-8 text-base-content">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <ApiKeyHeader />
                {/* Error */}
                {error && (<div className="mb-6 p-4 bg-error/10 text-error rounded-xl text-sm">{error}</div>)}
                {/* Form */}
                <ApiKeyForm newProvider={newProvider} newKey={newKey} setNewProvider={setNewProvider} setNewKey={setNewKey} onAdd={handleAdd} />
                {/* List */}
                <ApiKeyList apiKeys={apiKeys} onDelete={deleteKey} onMonitor={monitorKey} />
                {/* Monitor */}
                {monitoringKey && (<ApiKeyMonitor monitoringKey={monitoringKey} models={models} isFetching={isFetchingModels} />)}
            </div>
        </div>
    );
}