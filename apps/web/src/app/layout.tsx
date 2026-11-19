import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { messages } from "@yigora/i18n";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: { default: messages.brand.name, template: `%s · ${messages.brand.name}` },
  description: messages.brand.tagline,
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es-419" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
