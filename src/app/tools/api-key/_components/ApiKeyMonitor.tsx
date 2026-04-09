import type { GroqModel, ApiKeyEntry } from "../_domain/api-key.schema";
import { Activity, Cpu, Loader2, ShieldCheck } from "lucide-react";

interface Props {
  monitoringKey: ApiKeyEntry;
  models: GroqModel[];
  isFetching: boolean;
}

export function ApiKeyMonitor({ monitoringKey, models, isFetching }: Props) {
  return (
    /* Card Container với thiết kế Flat UI */
    <section className="ui-card mt-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Header section của Monitor */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--color-ui-border)]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)]">
            <Activity size={18} />
          </div>
          <div>
            <h6>System Monitor</h6>
            <h3 className="!mb-0">{monitoringKey.provider}</h3>
          </div>
        </div>
        
        {/* Badge trạng thái */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-state-success)]/10 text-[var(--color-state-success)] border border-[var(--color-state-success)]/20">
          <ShieldCheck size={12} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Active</span>
        </div>
      </div>

      {isFetching ? (
        /* Loading State */
        <div className="flex flex-col items-center justify-center py-12 gap-3 opacity-50">
          <Loader2 size={24} className="animate-spin text-[var(--color-icon-brand)]" />
          <p className="text-xs uppercase tracking-widest font-bold">Syncing Models...</p>
        </div>
      ) : (
        /* Model List View */
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2 mb-1">
            <h6 className="!mb-0 italic">Available Architecture</h6>
            <h6 className="!mb-0">{models.length} Units</h6>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {models.map((m) => (
              <div 
                key={m.id} 
                className="flex items-center justify-between p-3 rounded-lg border border-[var(--color-ui-border)] bg-[var(--color-ui-bg)] hover:border-[var(--color-brand-primary)]/30 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Cpu size={14} className="text-[var(--color-icon-muted)] group-hover:text-[var(--color-icon-brand)] transition-colors" />
                  <span className="text-sm font-medium truncate text-[var(--color-ui-text-main)]">
                    {m.id}
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[var(--color-ui-border)] text-[var(--color-ui-text-subtle)]">
                  {m.owned_by.split('-')[0]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Footer Info */}
      <div className="mt-6 pt-4 border-t border-[var(--color-ui-border)]">
        <p className="text-[11px] text-[var(--color-ui-text-subtle)] flex items-center gap-2">
          <Activity size={12} />
          Last diagnostic: {new Date().toLocaleTimeString()}
        </p>
      </div>
    </section>
  );
}