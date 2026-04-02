import { ApiKeyItem } from "./ApiKeyItem";
import type { ApiKeyEntry } from "../_domain/api-key.schema";

interface Props {
  apiKeys: ApiKeyEntry[];
  onDelete: (index: number) => void;
  onMonitor: (item: ApiKeyEntry) => void;
}

export function ApiKeyList({ apiKeys, onDelete, onMonitor }: Props) {
  return (
    <div className="space-y-4">
      {apiKeys.map((item, idx) => (
        <ApiKeyItem
          key={idx}
          item={item}
          index={idx}
          onDelete={onDelete}
          onMonitor={onMonitor}
        />
      ))}
    </div>
  );
}