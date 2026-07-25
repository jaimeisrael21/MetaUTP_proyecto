import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MetaUTP",
  description:
    "Orientador independiente que cruza datos académicos con oportunidades documentadas para estudiantes UTP.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased" data-scroll-behavior="smooth">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
