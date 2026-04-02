import { Trash2, MonitorCog } from "lucide-react";
import { neoFlat } from "@/app/styles/neomorphism";
import type { ApiKeyEntry } from "../_domain/api-key.schema";

interface Props {
  item: ApiKeyEntry;
  index: number;
  onDelete: (index: number) => void;
  onMonitor: (item: ApiKeyEntry) => void;
}

export function ApiKeyItem({ item, index, onDelete, onMonitor }: Props) {
  return (
    <div className={`p-4 rounded-2xl flex justify-between ${neoFlat}`}>
      <div>
        <p className="font-bold">{item.provider}</p>
        <p className="text-xs opacity-40">
          {item.key.substring(0, 10)}•••
        </p>
      </div>

      <div className="flex gap-2">
        <button onClick={() => onMonitor(item)} className={`p-2 ${neoFlat}`}>
          <MonitorCog size={16} />
        </button>

        <button onClick={() => onDelete(index)} className={`p-2 text-error ${neoFlat}`}>
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}