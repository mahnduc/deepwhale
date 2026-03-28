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
      <body className="flex h-screen overflow-hidden">
        <ThemeProvider />
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-base-100 p-8">
          {children}
        </main>
      </body>
    </html>
  );
}