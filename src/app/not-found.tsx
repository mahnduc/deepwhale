import Link from "next/link";
import { Home, AlertCircle } from "lucide-react";

export default function NotFound() {
  const neoFlat = "shadow-[6px_6px_12px_rgba(0,0,0,0.1),-6px_-6px_12px_rgba(255,255,255,0.7)]";
  const neoInset = "shadow-[inset_6px_6px_12px_rgba(0,0,0,0.1),inset_-6px_-6px_12px_rgba(255,255,255,0.7)]";
  const neoPressed = "active:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.1),inset_-3px_-3px_6px_rgba(255,255,255,0.7)] active:scale-[0.98]";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-base-200 text-base-content p-6 text-center select-none">
      <h1 className="text-8xl md:text-9xl font-black italic tracking-tighter opacity-10 mb-4">
        404
      </h1>

      <div className="max-w-md">
        <h2 className="text-xl md:text-2xl font-black uppercase tracking-widest mb-4">
          <span className="text-primary">Page Not Found</span>
        </h2>
        <p className="text-[11px] font-bold opacity-40 uppercase tracking-[0.2em] leading-relaxed mb-10">
          Địa chỉ bạn đang truy cập không tồn tại.
        </p>

        <Link 
          href="/" 
          className={`inline-flex items-center gap-3 px-10 py-5 rounded-2xl text-[11px] font-black uppercase text-primary transition-all ${neoFlat} ${neoPressed}`}
        >
          Quay về Trang chủ
        </Link>
      </div>

    </div>
  );
}