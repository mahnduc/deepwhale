'use client';

import { useState, useEffect, useCallback } from 'react';
import chroma from 'chroma-js';
import {
  Palette,
  Settings2,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Type,
  Layout as LayoutIcon,
  MousePointer2,
  Smile
} from 'lucide-react';

// --- Configuration & Types ---
const COLOR_SCHEMA = [
  {
    title: 'Thương hiệu',
    items: [
      { id: 'brand-primary', label: 'Primary', desc: 'Brand Main', default: '#111111' },
      { id: 'brand-secondary', label: 'Secondary', desc: 'Brand Sub', default: '#3f3f46' },
      { id: 'brand-accent', label: 'Accent', desc: 'Accent Color', default: '#18181b' },
    ]
  },
  {
    title: 'Typography',
    items: [
      { id: 'ui-text-main', label: 'Text Main', desc: 'Content', default: '#09090b' },
      { id: 'ui-text-muted', label: 'Text Muted', desc: 'Description', default: '#71717a' },
      { id: 'ui-text-subtle', label: 'Text Subtle', desc: 'Disabled', default: '#a1a1aa' },
    ]
  },
  {
    title: 'Hệ thống',
    items: [
      { id: 'ui-bg', label: 'Background', desc: 'App Base', default: '#fafafa' },
      { id: 'ui-card', label: 'Card', desc: 'Surface', default: '#ffffff' },
      { id: 'ui-border', label: 'Border', desc: 'Stroke', default: '#e4e4e7' },
    ]
  },
  {
    title: 'Ngữ nghĩa',
    items: [
      { id: 'state-success', label: 'Success', desc: 'Positive', default: '#16a34a' },
      { id: 'state-error', label: 'Error', desc: 'Negative', default: '#dc2626' },
      { id: 'state-warning', label: 'Warning', desc: 'Caution', default: '#d97706' },
      { id: 'state-info', label: 'Info', desc: 'Neutral', default: '#2563eb' },
    ]
  }
];

// --- Sub-Components ---

const PaletteLine = ({ baseColor, onSelect }: { baseColor: string; onSelect: (c: string) => void }) => {
  if (!chroma.valid(baseColor)) return <div className="h-4 mt-3 bg-[var(--color-ui-border)]/50 rounded-full animate-pulse" />;
  const palette = chroma.scale(['#fff', baseColor, '#000']).mode('lch').colors(8);

  return (
    <div className="flex w-full h-4 rounded-md overflow-hidden border border-[var(--color-ui-border)] mt-3">
      {palette.map((c, i) => (
        <button
          key={i}
          type="button"
          className="flex-1 h-full transition-opacity hover:opacity-80"
          style={{ backgroundColor: c }}
          onClick={() => onSelect(c)}
          title={c}
        />
      ))}
    </div>
  );
};

const ColorControl = ({ item, currentValue, onUpdate }: { item: any, currentValue: string, onUpdate: (id: string, hex: string) => void }) => (
  <div className="space-y-1">
    <div className="flex justify-between items-center">
      <div className="space-y-0.5">
        <h5 className="mb-0 text-[var(--color-ui-text-main)]">{item.label}</h5>
        <h6 className="mb-0 text-[var(--color-ui-text-muted)] lowercase">{item.desc}</h6>
      </div>
      <div className="flex items-center gap-2 bg-[var(--color-ui-bg)] px-2 py-1 rounded-md border border-[var(--color-ui-border)]">
        <div className="relative w-4 h-4 rounded-sm border border-[var(--color-ui-border)] overflow-hidden shrink-0">
          <input
            type="color"
            value={chroma(currentValue).hex()}
            onChange={(e) => onUpdate(item.id, e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <div className="w-full h-full" style={{ backgroundColor: currentValue }} />
        </div>
        <span className="text-[11px] font-mono font-bold uppercase text-[var(--color-ui-text-main)]">
          {currentValue}
        </span>
      </div>
    </div>
    <PaletteLine baseColor={currentValue} onSelect={(c) => onUpdate(item.id, c)} />
  </div>
);

export default function DesignSystemEditor() {
  const [currentColors, setCurrentColors] = useState<Record<string, string>>(() =>
    COLOR_SCHEMA.flatMap(g => g.items).reduce((acc, item) => ({ ...acc, [item.id]: item.default }), {})
  );

  const applyColorToDom = useCallback((id: string, hex: string) => {
    if (chroma.valid(hex)) {
      const root = document.documentElement;
      root.style.setProperty(`--${id}`, hex);
      root.style.setProperty(`--color-${id}`, hex);
    }
  }, []);

  const updateGlobalVar = (id: string, hex: string) => {
    setCurrentColors(prev => ({ ...prev, [id]: hex }));
    applyColorToDom(id, hex);
  };

  useEffect(() => {
    Object.entries(currentColors).forEach(([id, hex]) => applyColorToDom(id, hex));
  }, [applyColorToDom]);

  return (
    <div className="min-h-screen bg-[var(--color-ui-bg)] text-[var(--color-ui-text-main)] p-6 lg:p-10">
      <div className="max-w-[1400px] mx-auto space-y-12">
        
        {/* Header section style defined by typography layers */}
        <div className="border-b border-[var(--color-ui-border)] pb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Palette className="text-[var(--color-brand-primary)]" size={28} />
              <h1 className="my-0">UI Kit Engine</h1>
            </div>
            <p className="text-[var(--color-ui-text-muted)] mt-1 mb-0">Hệ thống quản lý Design System thời gian thực</p>
          </div>
          <h6 className="bg-[var(--color-ui-card)] px-3 py-1 rounded-md border border-[var(--color-ui-border)] mb-0">v4.0.0</h6>
        </div>

        {/* Configuration grid with ui-card layer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {COLOR_SCHEMA.map((group, idx) => (
            <div key={idx} className="ui-card flex flex-col gap-6">
              <div className="flex items-center gap-2 border-b border-[var(--color-ui-border)] pb-3">
                <Settings2 size={14} className="text-[var(--color-icon-muted)]" />
                <h6 className="mb-0">{group.title}</h6>
              </div>
              <div className="space-y-8">
                {group.items.map((item) => (
                  <ColorControl 
                    key={item.id} 
                    item={item} 
                    currentValue={currentColors[item.id]} 
                    onUpdate={updateGlobalVar} 
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Visual Showcase */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-l-4 border-[var(--color-brand-primary)] pl-4">
            <LayoutIcon size={20} className="text-[var(--color-brand-primary)]" />
            <h2 className="my-0">Live Workspace</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Typography Showcase */}
            <div className="lg:col-span-4 ui-card space-y-6">
              <div className="flex items-center gap-2 border-b border-[var(--color-ui-border)] pb-3">
                <Type size={16} className="text-[var(--color-icon-muted)]" />
                <h6 className="mb-0">Typography Stack</h6>
              </div>
              <div className="space-y-4">
                <h1>Heading H1 Bold</h1>
                <h2>Heading H2 Semibold</h2>
                <h3>Heading H3 Medium</h3>
                <h4>Heading H4 Small</h4>
                <p>Nội dung chính sử dụng <strong>Flat UI</strong> cho trải nghiệm tối giản. Phân cấp rõ ràng giúp người dùng tập trung vào dữ liệu quan trọng.</p>
                <p className="text-[var(--color-ui-text-muted)] italic">Text muted: Sử dụng cho các chú thích hoặc nội dung phụ.</p>
              </div>
            </div>

            {/* Right: Interactive Showcase */}
            <div className="lg:col-span-8 space-y-6">
              <div className="ui-card grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <h5 className="border-b border-[var(--color-ui-border)] pb-2">Actions & Branding</h5>
                  <div className="flex flex-wrap gap-3">
                    <button className="h-10 px-5 bg-[var(--color-brand-primary)] text-[var(--color-ui-bg)] rounded-md font-semibold text-sm hover:opacity-90 transition-all flex items-center gap-2">
                      <MousePointer2 size={16} />
                      Primary
                    </button>
                    <button className="h-10 px-5 border border-[var(--color-ui-border)] text-[var(--color-ui-text-main)] rounded-md font-semibold text-sm hover:bg-[var(--color-ui-border)]/10 transition-all">
                      Secondary
                    </button>
                  </div>
                  <div className="flex items-center gap-8 pt-2">
                    <div className="text-center">
                      <Smile className="text-[var(--color-brand-primary)] mb-1" size={24} />
                      <h6 className="mb-0">Brand</h6>
                    </div>
                    <div className="text-center">
                      <Smile className="text-[var(--color-icon-main)] mb-1" size={24} />
                      <h6 className="mb-0">Main</h6>
                    </div>
                    <div className="text-center">
                      <Smile className="text-[var(--color-icon-muted)] mb-1" size={24} />
                      <h6 className="mb-0">Muted</h6>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="border-b border-[var(--color-ui-border)] pb-2">Status Feedback</h5>
                  <div className="ui-card-interactive !p-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-[var(--color-state-success)] flex items-center justify-center text-white shadow-sm shrink-0">
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-sm mb-0 text-[var(--color-state-success)] uppercase tracking-tight">Sync Complete</p>
                      <h6 className="mb-0 lowercase opacity-70">Tất cả dữ liệu đã được lưu</h6>
                    </div>
                  </div>
                  <div className="ui-card-outline text-center !py-4">
                    <p className="text-xs text-[var(--color-ui-text-muted)] mb-0">Drop files to upload</p>
                  </div>
                </div>
              </div>

              {/* Status Grid using ui-card-interactive */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { id: 'state-success', icon: <CheckCircle2 size={18} />, label: 'Success' },
                  { id: 'state-error', icon: <AlertCircle size={18} />, label: 'Error' },
                  { id: 'state-warning', icon: <AlertTriangle size={18} />, label: 'Warning' },
                  { id: 'state-info', icon: <Info size={18} />, label: 'Info' },
                ].map(s => (
                  <div key={s.id} className="ui-card-interactive !p-4 flex flex-col items-center gap-3 text-center">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white shadow-sm"
                      style={{ backgroundColor: `var(--${s.id})` }}
                    >
                      {s.icon}
                    </div>
                    <h6 className="mb-0 font-black tracking-widest" style={{ color: `var(--${s.id})` }}>
                      {s.label}
                    </h6>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}