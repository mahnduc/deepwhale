'use client';

import { useState } from "react";
import ThemeProvider from "@/components/ThemeProvider";
import "./globals.css";
import Sidebar from "@/components/sidebar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <html lang="en">
      <body className="flex h-screen w-full overflow-hidden bg-base-200 transition-colors duration-300 scrollbar-hide">
        <ThemeProvider />
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        
        <main className="flex-1 h-full overflow-y-auto scrollbar-hide relative transition-all duration-300 bg-base-200">
          <div className="w-full h-full p-0">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}