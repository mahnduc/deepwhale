import { Roboto_Mono } from "next/font/google";
import "./globals.css";

const robotoMono = Roboto_Mono({ 
  subsets: ["latin", "vietnamese"], 
  variable: "--font-roboto-mono" 
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${robotoMono.variable} dark`}>
      <body className="bg-[#000000] antialiased font-mono">
        {children}
      </body>
    </html>
  );
}