// _lib/api-key.schema.ts

export type Provider = "Groq" | "Gemini" | string;

export interface ApiKeyEntry {
  provider: Provider;
  key: string;
}

export interface GroqModel {
  id: string;
  owned_by: string;
  active: boolean;
}

export interface GroqModelResponse {
  data: GroqModel[];
}