import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rellenador de documentos · Obras",
  description:
    "Herramienta para rellenar formularios PDF de obras del colegio de arquitectos. Multi-despacho.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
