import { useEffect, useState } from "react";
import type { ApiKeyEntry, GroqModel } from "../_domain/api-key.schema";
import {
  loadApiKeys,
  saveApiKeys,
  fetchGroqModels
} from "../_domain/index.domain";

export const useApiKey = () => {
  const [apiKeys, setApiKeys] = useState<ApiKeyEntry[]>([]);
  const [models, setModels] = useState<GroqModel[]>([]);
  const [monitoringKey, setMonitoringKey] = useState<ApiKeyEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFetchingModels, setIsFetchingModels] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await loadApiKeys();
      setApiKeys(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updated: ApiKeyEntry[]) => {
    await saveApiKeys(updated);
    setApiKeys(updated);
  };

  const addKey = async (provider: string, key: string) => {
    if (!provider || !key) return;
    const updated = [...apiKeys, { provider, key }];
    await handleSave(updated);
  };

  const deleteKey = async (index: number) => {
    const keyToDelete = apiKeys[index];
    const updated = apiKeys.filter((_, i) => i !== index);
    await handleSave(updated);
    if (monitoringKey === keyToDelete) {
      setMonitoringKey(null);
      setModels([]);
    }
  };

  const monitorKey = async (item: ApiKeyEntry) => {
    if (item.provider !== "Groq") throw new Error("Chỉ hỗ trợ Groq");
    setMonitoringKey(item);
    setIsFetchingModels(true);
    try {
      const data = await fetchGroqModels(item.key);
      setModels(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsFetchingModels(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    apiKeys,
    models,
    monitoringKey,
    loading,
    error,
    isFetchingModels,
    addKey,
    deleteKey,
    monitorKey,
    loadData
  };
};