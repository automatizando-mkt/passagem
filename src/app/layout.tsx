import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Passagem — Passagens de Barco Online",
  description: "Sistema de controle e venda de passagens de barco",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
