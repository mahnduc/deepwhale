'use client';

import { useState } from 'react';
import chroma from 'chroma-js';
import { 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  Palette, 
  LayoutTemplate,
  MousePointer2
} from 'lucide-react';

const COLOR_SCHEMA = [
  {
    title: 'Nhóm màu Thương hiệu',
    items: [
      { id: 'brand-primary', label: 'Primary', desc: 'Nút CTA, link chính', default: '#8d1ff4' },
      { id: 'brand-secondary', label: 'Secondary', desc: 'Hỗ trợ màu chính', default: '#532762' },
      { id: 'brand-accent', label: 'Accent', desc: 'Huy hiệu, điểm nhấn', default: '#f472b6' },
    ]
  },
  {
    title: 'Nhóm màu Trung tính',
    items: [
      { id: 'ui-bg', label: 'Surface', desc: 'Nền trang chính', default: '#f8fafc' },
      { id: 'ui-card', label: 'Card', desc: 'Khối nội dung', default: '#ffffff' },
      { id: 'ui-border', label: 'Border', desc: 'Đường kẻ, viền', default: '#e2e8f0' },
      { id: 'ui-text-main', label: 'Text Main', desc: 'Nội dung chính', default: '#0f172a' },
      { id: 'ui-text-muted', label: 'Text Muted', desc: 'Mô tả phụ', default: '#64748b' },
    ]
  },
  {
    title: 'Nhóm màu Ngữ nghĩa',
    items: [
      { id: 'state-success', label: 'Success', desc: 'Trạng thái thành công', default: '#22c55e' },
      { id: 'state-error', label: 'Error', desc: 'Cảnh báo nguy hiểm', default: '#ef4444' },
      { id: 'state-warning', label: 'Warning', desc: 'Lưu ý, cẩn trọng', default: '#f59e0b' },
      { id: 'state-info', label: 'Info', desc: 'Hướng dẫn, mẹo', default: '#3b82f6' },
    ]
  }
];

export default function DesignSystemEditor() {
  const [currentColors, setCurrentColors] = useState(() =>
    COLOR_SCHEMA.flatMap(g => g.items).reduce((acc, item) => ({ ...acc, [item.id]: item.default }), {})
  );

  const isValidColor = (color: string) => chroma.valid(color);

  const updateGlobalVar = (id: string, hex: string) => {
    setCurrentColors(prev => ({ ...prev, [id]: hex }));
    if (isValidColor(hex)) {
      document.documentElement.style.setProperty(`--${id}`, hex);
    }
  };

  const renderPalette = (baseColor: string, id: string) => {
    if (!isValidColor(baseColor)) return <div className="h-2 mt-3 bg-ui-border/20 rounded-full animate-pulse" />;
    
    try {
      const palette = chroma.scale(['#fff', baseColor, '#000']).mode('lch').colors(7);
      return (
        <div className="flex gap-1.5 mt-3">
          {palette.slice(1, 6).map((c, i) => (
            <button
              key={i}
              type="button"
              className="flex-1 h-2 rounded-full border border-ui-border transition-transform hover:scale-110"
              style={{ backgroundColor: c }}
              onClick={() => updateGlobalVar(id, c)}
            />
          ))}
        </div>
      );
    } catch (e) { return null; }
  };

  return (
    <div className="min-h-screen bg-ui-bg text-ui-text-main transition-colors duration-300">
      <div className="max-w-full mx-auto p-6 lg:p-12 space-y-12">
        
        {/* HEADER - Tuân thủ Typography H1 */}
        <header className="space-y-2 border-b border-ui-border pb-8">
          <div className="flex items-center gap-3">
            <Palette className="text-brand-primary" size={32} />
            <h1 className="text-3xl font-bold tracking-tight text-ui-text-main">UI Customizer</h1>
          </div>
          <p className="text-base text-ui-text-muted max-w-2xl">
            Hệ thống tùy chỉnh giao diện dựa trên Semantic Tokens. 
            Mọi thay đổi sẽ cập nhật trực tiếp vào hệ thống biến CSS.
          </p>
        </header>

        {/* EDITOR GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {COLOR_SCHEMA.map((group, idx) => (
            <section key={idx} className="bg-ui-card p-6 rounded-2xl border border-ui-border space-y-6 shadow-sm">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-ui-text-main">
                <div className="w-1.5 h-5 bg-brand-primary rounded-full" />
                {group.title}
              </h2>

              <div className="space-y-6">
                {group.items.map((item) => (
                  <div key={item.id} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <label className="text-sm font-medium text-ui-text-main">{item.label}</label>
                      <span className="text-xs text-ui-text-muted">{item.desc}</span>
                    </div>

                    <div className="flex items-center gap-3 p-2.5 bg-ui-bg rounded-xl border border-ui-border focus-within:ring-2 ring-brand-primary/20 transition-all">
                      <input
                        type="color"
                        // @ts-ignore
                        value={currentColors[item.id]}
                        onChange={(e) => updateGlobalVar(item.id, e.target.value)}
                        className="w-6 h-6 rounded-md cursor-pointer bg-transparent border-none"
                      />
                      <input
                        type="text"
                        // @ts-ignore
                        value={currentColors[item.id].toUpperCase()}
                        onChange={(e) => updateGlobalVar(item.id, e.target.value)}
                        className="bg-transparent font-mono text-xs w-full outline-none text-ui-text-main"
                      />
                    </div>
                    {/* @ts-ignore */}
                    {renderPalette(currentColors[item.id], item.id)}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* PREVIEW AREA */}
        <section className="space-y-8 pt-8">
          <div className="flex items-center gap-4">
            <LayoutTemplate size={24} className="text-ui-text-muted" />
            <h2 className="text-xl font-semibold text-ui-text-main">Live UI Preview</h2>
            <div className="h-px flex-1 bg-ui-border" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Card mẫu 1: Brand & Layout */}
            <div className="bg-ui-card p-8 rounded-2xl border border-ui-border space-y-6 shadow-sm">
              <div className="flex justify-between items-center">
                <span className="px-2.5 py-0.5 bg-brand-accent text-white text-[10px] font-bold uppercase tracking-wider rounded-md">
                  New Update
                </span>
                <MousePointer2 size={16} className="text-ui-text-muted" />
              </div>

              <h3 className="text-xl font-semibold text-ui-text-main">Trải nghiệm Flat UI</h3>

              <p className="text-base text-ui-text-muted leading-relaxed">
                Sử dụng hệ thống lưới và khoảng cách <span className="font-medium text-ui-text-main">space-y-8</span> để phân cấp nội dung mà không cần dùng quá nhiều màu sắc gắt. 
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button className="flex-1 py-2.5 bg-brand-primary text-white rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-[0.98]">
                  Primary Action
                </button>
                <button className="flex-1 py-2.5 border border-ui-border text-ui-text-main rounded-xl font-bold text-sm hover:bg-ui-border/10 transition-colors active:scale-[0.98]">
                  Secondary
                </button>
              </div>
            </div>

            {/* Card mẫu 2: Semantic States */}
            <div className="grid grid-cols-1 gap-4">
              {[
                { label: 'Giao dịch thành công', color: 'state-success', icon: <CheckCircle2 size={18}/>, desc: 'Dữ liệu đã được đồng bộ.' },
                { label: 'Lỗi kết nối máy chủ', color: 'state-error', icon: <AlertCircle size={18}/>, desc: 'Vui lòng kiểm tra lại đường truyền.' },
                { label: 'Cảnh báo bảo mật', color: 'state-warning', icon: <AlertTriangle size={18}/>, desc: 'Tài khoản chưa được xác thực.' },
                { label: 'Thông tin hệ thống', color: 'state-info', icon: <Info size={18}/>, desc: 'Phiên bản v4.0.1 đã sẵn sàng.' }
              ].map((state, i) => (
                <div key={i} className="bg-ui-card p-4 rounded-2xl border border-ui-border border-l-4 shadow-sm flex items-start gap-4 transition-transform hover:translate-x-1" 
                     style={{ borderLeftColor: `var(--${state.color})` }}>
                  <div className="p-2 rounded-lg" style={{ backgroundColor: `var(--${state.color})20`, color: `var(--${state.color})` }}>
                    {state.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-ui-text-main">{state.label}</h4>
                    <p className="text-xs text-ui-text-muted mt-0.5">{state.desc}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>
      </div>
    </div>
  );
}