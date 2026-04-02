import { Plus } from "lucide-react";
import { neoFlat, neoInset, neoPressed } from "@/app/styles/neomorphism";

interface Props {
  newProvider: string;
  newKey: string;
  setNewProvider: (v: string) => void;
  setNewKey: (v: string) => void;
  onAdd: () => void;
}

export function ApiKeyForm({
  newProvider,
  newKey,
  setNewProvider,
  setNewKey,
  onAdd
}: Props) {
  return (
    <section className={`rounded-3xl p-6 mb-10 ${neoFlat}`}>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

        <select
          className={`md:col-span-4 select ${neoInset}`}
          value={newProvider}
          onChange={(e) => setNewProvider(e.target.value)}
        >
          <option value="">Provider...</option>
          <option value="Gemini">Gemini</option>
          <option value="Groq">Groq</option>
        </select>

        <input
          type="password"
          className={`md:col-span-6 input font-mono ${neoInset}`}
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          placeholder="API Key..."
        />

        <button
          className={`md:col-span-2 btn ${neoFlat} ${neoPressed}`}
          onClick={onAdd}
        >
          <Plus size={18} />
        </button>

      </div>
    </section>
  );
}