import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Darts stratégia",
  description: "Score-alapú darts kiszálló és stratégia táblák"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="hu">
      <body>{children}</body>
    </html>
  );
}
