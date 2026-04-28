import "./globals.css";
import type { Metadata } from "next";
import Providers from "./providers";
import AppShell from "@/components/layout/AppShell";
import { AuthProvider } from "@/features/auth/AuthProvider";

export const metadata: Metadata = {
  title: "Т-Мероприятия",
  description: "Клиентская часть Т-Мероприятий",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-brand-white text-brand-black">
        <Providers>
          <AuthProvider>
            <AppShell>{children}</AppShell>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
