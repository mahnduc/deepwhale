import "./globals.css";
import Sidebar from "@/components/sidebar";
import { cookies } from "next/headers";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme")?.value || "light";

  return (
    <html lang="en" data-theme={theme}>
      <body className="flex h-screen overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto bg-base-100 p-8">
          {children}
        </main>
      </body>
    </html>
  );
}