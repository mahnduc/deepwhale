import Link from "next/link";
import { Home, OctagonAlert } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[100vh] p-4 sm:p-8 bg-[var(--color-ui-bg)]">
      <div className="ui-card max-w-sm w-full flex flex-col items-center text-center py-12 px-6">
        <div className="mb-6 relative">
          <OctagonAlert 
            size={64} 
            className="text-[var(--color-state-error)] opacity-20 absolute inset-0 scale-150 blur-xl" 
          />
          <OctagonAlert 
            size={64} 
            className="text-[var(--color-state-error)] relative z-10" 
          />
        </div>

        {/* Typography */}
        <h1 className="mt-2 mb-1 uppercase tracking-tighter text-4xl font-black">
          404
        </h1>
        
        <h6>Page Not Found</h6>
        
        <p className="text-[var(--color-ui-text-muted)] mt-4 mb-8 max-w-[240px]">
          Địa chỉ bạn đang truy cập không tồn tại hoặc đã bị di dời.
        </p>

        <Link 
          href="/" 
          className="ui-card-interactive w-full flex items-center justify-center gap-2 no-underline group"
        >
          <Home 
            size={18} 
            className="text-[var(--color-icon-brand)] group-hover:scale-110 transition-transform" 
          />
          <span className="font-semibold text-sm text-[var(--color-ui-text-main)]">
            Quay về Trang chủ
          </span>
        </Link>
        
      </div>
    </div>
  );
}