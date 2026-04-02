import { neoInset } from "@/app/styles/neomorphism";
import type { GroqModel, ApiKeyEntry } from "../_domain/api-key.schema";

interface Props {
  monitoringKey: ApiKeyEntry;
  models: GroqModel[];
  isFetching: boolean;
}

export function ApiKeyMonitor({ monitoringKey, models, isFetching }: Props) {
  return (
    <section className={`mt-10 p-6 rounded-3xl ${neoInset}`}>
      <h2 className="font-bold mb-4">
        Monitor: {monitoringKey.provider}
      </h2>

      {isFetching ? (
        <p>Loading models...</p>
      ) : (
        <div className="space-y-2">
          {models.map((m) => (
            <div key={m.id} className="text-xs flex justify-between">
              <span>{m.id}</span>
              <span className="opacity-40">{m.owned_by}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}