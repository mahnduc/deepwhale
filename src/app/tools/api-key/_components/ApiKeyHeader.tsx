import { Key, ShieldCheck } from "lucide-react";
import { neoFlat, neoInset } from "@/app/styles/neomorphism";

export function ApiKeyHeader() {
  return (
    <header className="mb-12 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-2xl ${neoFlat}`}>
          <Key size={24} />
        </div>
        <h1 className="text-3xl font-black uppercase">
          QUẢN LÝ API KEY
        </h1>
      </div>

      <div className={`hidden md:flex px-4 py-2 rounded-full text-success items-center gap-2 ${neoInset}`}>
        <ShieldCheck size={14} /> SECURE
      </div>
    </header>
  );
}