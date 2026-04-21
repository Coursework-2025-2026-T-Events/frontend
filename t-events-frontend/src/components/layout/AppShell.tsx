"use client";

import { useState } from "react";
import Container from "@/components/ui/Container";
import Link from "next/link";
import { useAuth } from "@/features/auth/AuthProvider";

export default function AppShell({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const closeMenu = () => setIsMobileMenuOpen(false);

    return (
        <div className="min-h-screen">
            <header className="sticky top-0 z-50 border-b border-neutral-200 bg-[var(--color-brand-white)]">
                <Container>
                    <div className="flex h-16 items-center justify-between">
                        <Link
                            href="/"
                            className="text-lg font-bold rounded-md px-2 py-1 outline-none transition-shadow hover:opacity-80 focus-visible:ring-2 focus-visible:ring-[var(--color-brand-yellow)]"
                        >
                            T‑Events
                        </Link>

                        {/* Десктопное меню */}
                        <nav className="hidden items-center gap-6 sm:flex">
                            <Link
                                href="/events"
                                className="text-sm font-medium rounded-md px-2 py-1 outline-none transition-colors hover:text-neutral-600 focus-visible:ring-2 focus-visible:ring-[var(--color-brand-yellow)]"
                            >
                                Мероприятия
                            </Link>

                            {user ? (
                                <>
                                    <span className="text-sm font-medium text-neutral-600">{user.full_name}</span>
                                    <button
                                        onClick={() => {
                                            void logout();
                                        }}
                                        className="text-sm font-medium rounded-md px-2 py-1 outline-none transition-colors hover:text-neutral-600 focus-visible:ring-2 focus-visible:ring-[var(--color-brand-yellow)]"
                                    >
                                        Выйти
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/auth/login"
                                        className="text-sm font-medium rounded-md px-2 py-1 outline-none transition-colors hover:text-neutral-600 focus-visible:ring-2 focus-visible:ring-[var(--color-brand-yellow)]"
                                    >
                                        Вход
                                    </Link>
                                    <Link
                                        href="/auth/register"
                                        className="text-sm font-medium rounded-md px-4 py-2 bg-[var(--color-brand-yellow)] text-black outline-none transition-colors hover:opacity-90 focus-visible:ring-2 focus-visible:ring-black"
                                    >
                                        Регистрация
                                    </Link>
                                </>
                            )}
                        </nav>

                        {/* Кнопка мобильного меню */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-expanded={isMobileMenuOpen}
                            aria-controls="mobile-menu"
                            aria-label={isMobileMenuOpen ? "Закрыть меню" : "Открыть меню"}
                            className="sm:hidden rounded-md p-2 outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-yellow)]"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                {isMobileMenuOpen ? (
                                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                ) : (
                                    <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                )}
                            </svg>
                        </button>
                    </div>
                </Container>

                {/* Мобильное меню (Dropdown) */}
                {isMobileMenuOpen && (
                    <div id="mobile-menu" className="border-t border-neutral-100 bg-white sm:hidden slide-down">
                        <Container>
                            <nav className="flex flex-col gap-4 py-4 text-base font-medium">
                                <Link
                                    href="/events"
                                    onClick={closeMenu}
                                    className="rounded-md px-2 py-1 outline-none hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-[var(--color-brand-yellow)]"
                                >
                                    Мероприятия
                                </Link>
                                {user ? (
                                    <>
                                        <span className="px-2 py-1 text-neutral-600">{user.full_name}</span>
                                        <button
                                            onClick={() => {
                                                void logout();
                                                closeMenu();
                                            }}
                                            className="rounded-md px-2 py-1 text-left outline-none hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-[var(--color-brand-yellow)]"
                                        >
                                            Выйти
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href="/auth/login"
                                            onClick={closeMenu}
                                            className="rounded-md px-2 py-1 outline-none hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-[var(--color-brand-yellow)]"
                                        >
                                            Вход
                                        </Link>
                                        <Link
                                            href="/auth/register"
                                            onClick={closeMenu}
                                            className="rounded-md px-2 py-1 outline-none hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-[var(--color-brand-yellow)]"
                                        >
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
