"use client";

import { useState } from "react";
import Link from "next/link";
import { LogOut, Menu, X } from "lucide-react";
import Container from "@/components/ui/Container";
import { useAuth } from "@/features/auth/AuthProvider";
import type { UserRole } from "@/lib/api/types";
import { routes } from "@/lib/routes";

const roleLabels: Record<UserRole, string> = {
  participant: "участник",
  stander: "стойка",
  admin: "админ",
};

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMenu = () => setIsMobileMenuOpen(false);
  const isStander = user?.role === "stander" || user?.role === "admin";
  const isAdmin = user?.role === "admin";
  const navLinkClassName =
    "rounded-md px-3 py-2 text-sm font-semibold text-[var(--color-brand-graphite)] outline-none transition-colors hover:bg-[var(--color-brand-panel)] hover:text-[var(--color-brand-ink)] focus-visible:ring-2 focus-visible:ring-[var(--color-brand-yellow)]";
  const mobileNavLinkClassName =
    "rounded-md px-3 py-2.5 outline-none hover:bg-[var(--color-brand-panel)] focus-visible:ring-2 focus-visible:ring-[var(--color-brand-yellow)]";

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-[var(--color-brand-line)] bg-white/95 backdrop-blur">
        <Container>
          <div className="flex h-[68px] items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-md px-1 py-1 text-lg font-bold text-[var(--color-brand-ink)] outline-none transition-shadow hover:opacity-85 focus-visible:ring-2 focus-visible:ring-[var(--color-brand-yellow)]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--color-brand-yellow)] text-base font-bold text-[var(--color-brand-ink)]">
                T
              </span>
              <span>T-Events</span>
            </Link>

            <nav className="hidden items-center gap-1 lg:flex">
              <Link href={routes.events} className={navLinkClassName}>
                Мероприятия
              </Link>
              {user?.role === "participant" && (
                <Link href={routes.currentParticipation} className={navLinkClassName}>
                  Текущее участие
                </Link>
              )}

              {isStander && (
                <>
                  <Link href={routes.standerScan} className={navLinkClassName}>
                    Сканер QR
                  </Link>
                  <Link href={routes.standerInventory} className={navLinkClassName}>
                    Выдачи
                  </Link>
                </>
              )}

              {isAdmin && (
                <Link href={routes.adminEvents} className={navLinkClassName}>
                  Админка
                </Link>
              )}

              {user ? (
                <>
                  <span className="ml-2 max-w-44 truncate text-sm font-semibold text-[var(--color-brand-muted)]">
                    {user.full_name}
                    {isStander && (
                      <span className="ml-1.5 rounded-full bg-[var(--color-brand-yellow)] px-1.5 py-0.5 text-[10px] font-bold uppercase text-[var(--color-brand-ink)]">
                        {roleLabels[user.role]}
                      </span>
                    )}
                  </span>
                  <button
                    onClick={() => {
                      void logout();
                    }}
                    className={`${navLinkClassName} inline-flex items-center gap-1.5`}
                  >
                    <LogOut className="h-4 w-4" aria-hidden />
                    Выйти
                  </button>
                </>
              ) : (
                <>
                  <Link href={routes.login} className={navLinkClassName}>
                    Вход
                  </Link>
                  <Link
                    href={routes.register}
                    className="rounded-md bg-[var(--color-brand-yellow)] px-4 py-2 text-sm font-semibold text-[var(--color-brand-ink)] outline-none transition-colors hover:bg-[var(--color-brand-yellow-hover)] focus-visible:ring-2 focus-visible:ring-black"
                  >
                    Регистрация
                  </Link>
                </>
              )}
            </nav>

            <button
              onClick={() => setIsMobileMenuOpen((value) => !value)}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMobileMenuOpen ? "Закрыть меню" : "Открыть меню"}
              className="rounded-md p-2 outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-yellow)] lg:hidden"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" aria-hidden /> : <Menu className="h-6 w-6" aria-hidden />}
            </button>
          </div>
        </Container>

        {isMobileMenuOpen && (
          <div id="mobile-menu" className="border-t border-[var(--color-brand-line)] bg-white lg:hidden">
            <Container>
              <nav className="flex flex-col gap-2 py-4 text-base font-semibold">
                <Link href={routes.events} onClick={closeMenu} className={mobileNavLinkClassName}>
                  Мероприятия
                </Link>
                {user?.role === "participant" && (
                  <Link href={routes.currentParticipation} onClick={closeMenu} className={mobileNavLinkClassName}>
                    Текущее участие
                  </Link>
                )}

                {isStander && (
                  <>
                    <Link href={routes.standerScan} onClick={closeMenu} className={mobileNavLinkClassName}>
                      Сканер QR
                    </Link>
                    <Link href={routes.standerInventory} onClick={closeMenu} className={mobileNavLinkClassName}>
                      Выдачи
                    </Link>
                  </>
                )}

                {isAdmin && (
                  <Link href={routes.adminEvents} onClick={closeMenu} className={mobileNavLinkClassName}>
                    Админка
                  </Link>
                )}

                {user ? (
                  <>
                    <span className="px-3 py-2 text-sm text-[var(--color-brand-muted)]">{user.full_name}</span>
                    <button
                      onClick={() => {
                        void logout();
                        closeMenu();
                      }}
                      className={`inline-flex items-center gap-2 text-left ${mobileNavLinkClassName}`}
                    >
                      <LogOut className="h-4 w-4" aria-hidden />
                      Выйти
                    </button>
                  </>
                ) : (
                  <>
                    <Link href={routes.login} onClick={closeMenu} className={mobileNavLinkClassName}>
                      Вход
                    </Link>
                    <Link href={routes.register} onClick={closeMenu} className={mobileNavLinkClassName}>
                      Регистрация
                    </Link>
                  </>
                )}
              </nav>
            </Container>
          </div>
        )}
      </header>

      <main>{children}</main>
    </div>
  );
}
