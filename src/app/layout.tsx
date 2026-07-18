import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MetaUTP",
  description: "Simulador académico y orientador de oportunidades para estudiantes UTP.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
