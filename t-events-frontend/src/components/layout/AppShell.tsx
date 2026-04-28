"use client";

import { useState } from "react";
import Link from "next/link";
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
    "rounded-md px-2.5 py-2 text-sm font-medium text-neutral-700 outline-none transition-colors hover:bg-neutral-100 hover:text-neutral-950 focus-visible:ring-2 focus-visible:ring-[var(--color-brand-yellow)]";
  const mobileNavLinkClassName =
    "rounded-md px-3 py-2 outline-none hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-[var(--color-brand-yellow)]";

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur">
        <Container>
          <div className="flex h-16 items-center justify-between">
            <Link
              href="/"
              className="rounded-md px-2 py-1 text-lg font-bold outline-none transition-shadow hover:opacity-80 focus-visible:ring-2 focus-visible:ring-[var(--color-brand-yellow)]"
            >
              T-Events
            </Link>

            <nav className="hidden items-center gap-1 sm:flex">
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
                  <span className="ml-2 max-w-44 truncate text-sm font-medium text-neutral-600">
                    {user.full_name}
                    {isStander && (
                      <span className="ml-1.5 rounded-full bg-[var(--color-brand-yellow)] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--color-brand-black)]">
                        {roleLabels[user.role]}
                      </span>
                    )}
                  </span>
                  <button
                    onClick={() => {
                      void logout();
                    }}
                    className={navLinkClassName}
                  >
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
                    className="rounded-md bg-[var(--color-brand-yellow)] px-4 py-2 text-sm font-medium text-black outline-none transition-colors hover:opacity-90 focus-visible:ring-2 focus-visible:ring-black"
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
              className="rounded-md p-2 outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-yellow)] sm:hidden"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                {isMobileMenuOpen ? (
                  <path
                    d="M18 6L6 18M6 6l12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ) : (
                  <path
                    d="M4 6h16M4 12h16M4 18h16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
              </svg>
            </button>
          </div>
        </Container>

        {isMobileMenuOpen && (
          <div id="mobile-menu" className="border-t border-neutral-100 bg-white sm:hidden">
            <Container>
              <nav className="flex flex-col gap-2 py-4 text-base font-medium">
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
                    <span className="px-3 py-2 text-sm text-neutral-500">{user.full_name}</span>
                    <button
                      onClick={() => {
                        void logout();
                        closeMenu();
                      }}
                      className={`text-left ${mobileNavLinkClassName}`}
                    >
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
