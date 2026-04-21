import "./globals.css";
import type { Metadata } from "next";
import Providers from "./providers";
import AppShell from "@/components/layout/AppShell";
import { AuthProvider } from "@/features/auth/AuthProvider";

export const metadata: Metadata = {
  title: "T-Events",
  description: "T-Events frontend",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-[var(--color-brand-white)] text-[var(--color-brand-black)]">
        <Providers>
          <AuthProvider>
            <AppShell>{children}</AppShell>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}