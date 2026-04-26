import { opfsApi } from "@/app/lib/opfs/opfsApis";

const SECRET_PATH = "/secrets/keys.enc";
export type KeysSchema = Record<string, string[]>;

// Factory Function tạo KeyService
const createKeyService = () => {
  // --- Private Helpers ---
  const ensureFolder = async () => {
    const exists = await opfsApi.exists("/secrets");
    if (!exists) await opfsApi.createFolder("/secrets");
  };

  const validateKey = async (provider: string, key: string): Promise<boolean> => {
    if (!key?.trim()) return false;
    
    const endpoints: Record<string, string> = {
      openai: "https://api.openai.com/v1/models",
      groq: "https://api.groq.com/openai/v1/models",
    };

    const url = endpoints[provider];
    if (!url) return false;

    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${key}` },
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  // --- Public API ---
  return {
    async load(): Promise<KeysSchema> {
      try {
        const exists = await opfsApi.exists(SECRET_PATH);
        return exists ? await opfsApi.readAsJson<KeysSchema>(SECRET_PATH) : {};
      } catch {
        return {};
      }
    },

    async save(data: KeysSchema) {
      await ensureFolder();
      await opfsApi.save(SECRET_PATH, JSON.stringify(data, null, 2));
    },

    async add(provider: string, key: string) {
      if (!key?.trim()) throw new Error("API key is empty");
      
      const isValid = await validateKey(provider, key);
      if (!isValid) throw new Error("Invalid API key");

      const data = await this.load();
      data[provider] = data[provider] || [];

      if (data[provider].includes(key)) throw new Error("Key already exists");

      data[provider].push(key);
      await this.save(data);
    },

    async remove(provider: string, key: string) {
      const data = await this.load();
      if (!data[provider]) return;

      data[provider] = data[provider].filter((k) => k !== key);
      if (data[provider].length === 0) delete data[provider];

      await this.save(data);
    },

    async getProviders(): Promise<string[]> {
      const data = await this.load();
      return Object.keys(data);
    },

    async getKeys(provider: string): Promise<string[]> {
      const data = await this.load();
      return data[provider] || [];
    }
  };
};

// Khởi tạo một instance duy nhất (Singleton)
export const keyService = createKeyService();