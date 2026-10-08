import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Panel de administracion | Figgi Store",
  robots: { index: false, follow: false },
  icons: { icon: "/icon.png" },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full bg-background text-foreground">{children}</body>
    </html>
  );
}
