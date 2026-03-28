import ThemeProvider from "@/components/ThemeProvider";
import "./globals.css";
import Sidebar from "@/components/sidebar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex h-screen w-full overflow-hidden bg-base-200">
        <ThemeProvider />
        
        {/* Sidebar nên có độ rộng cố định hoặc co giãn tùy bạn thiết lập bên trong component đó */}
        <Sidebar />
        
        {/* 1. flex-1: Chiếm toàn bộ không gian còn lại.
          2. w-full: Đảm bảo width luôn fill đầy.
          3. p-0: Loại bỏ padding để component con có thể tràn viền (Full Width).
          4. overflow-y-auto: Cho phép cuộn nội dung bên trong vùng main.
        */}
        <main className="flex-1 w-full h-full overflow-y-auto p-0">
          {children}
        </main>
      </body>
    </html>
  );
}