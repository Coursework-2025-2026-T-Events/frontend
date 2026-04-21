"use client";

import Link from "next/link";
import Typography from "@/components/ui/Typography";
import Button from "@/components/ui/Button";
import { useAuth } from "@/features/auth/AuthProvider";

export default function HomeHero() {
    const { user, isBootstrapping } = useAuth();
    const showGuestCta = !isBootstrapping && !user;
    const showUserCta = !isBootstrapping && Boolean(user);
    const onboardingChecklist = [
        user ? "Проверить активные мероприятия" : "Войти или создать аккаунт",
        "Открыть каталог мероприятий",
        "Выбрать активность и начать набирать баллы",
    ];

    return (
        <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1.05fr,1fr] lg:gap-10">
            <div className="order-2 lg:order-1">
                <p className="mb-4 inline-flex items-center rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.11em] text-neutral-600">
                    Первый запуск
                </p>

                <Typography
                    id="home-hero-heading"
                    as="h1"
                    size="2xl"
                    weight="bold"
                    className="text-balance text-3xl leading-tight tracking-tight text-neutral-950 sm:text-4xl lg:text-[2.85rem]"
                >
                    Понятный старт в T‑Events за несколько шагов
                </Typography>

                <Typography as="p" className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-neutral-600 sm:text-lg">
                    Выберите мероприятие, запустите активность и продолжайте с того же места в любой момент. Вся структура и прогресс уже
                    собраны в одном интерфейсе.
                </Typography>

                <div className="mt-6 grid max-w-xl grid-cols-3 gap-3 text-center">
                    <div className="rounded-xl border border-neutral-200 bg-white px-3 py-3">
                        <p className="text-lg font-bold text-neutral-900">3</p>
                        <p className="mt-1 text-xs text-neutral-600">шага до старта</p>
                    </div>
                    <div className="rounded-xl border border-neutral-200 bg-white px-3 py-3">
                        <p className="text-lg font-bold text-neutral-900">2–3 мин</p>
                        <p className="mt-1 text-xs text-neutral-600">первый проход</p>
                    </div>
                    <div className="rounded-xl border border-neutral-200 bg-white px-3 py-3">
                        <p className="text-lg font-bold text-neutral-900">100%</p>
                        <p className="mt-1 text-xs text-neutral-600">сохранение прогресса</p>
                    </div>
                </div>

                <div className="mt-8 flex min-h-[52px] w-full max-w-md flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:items-center">
                    {showUserCta ? (
                        <Button href="/events" className="w-full px-8 py-3.5 text-base font-semibold shadow-sm sm:w-auto sm:min-w-[220px]">
                            Перейти к мероприятиям
                        </Button>
                    ) : null}

                    {showGuestCta ? (
                        <>
                            <Button href="/auth/register" className="w-full px-8 py-3.5 text-base font-semibold shadow-sm sm:w-auto sm:min-w-[220px]">
                                Начать onboarding
                            </Button>
                            <Button
                                href="/events"
                                variant="secondary"
                                className="w-full border-neutral-300 bg-white px-8 py-3.5 text-base font-semibold sm:w-auto sm:min-w-[220px]"
                            >
                                Посмотреть мероприятия
                            </Button>
                        </>
                    ) : null}

                    {isBootstrapping ? (
                        <div
                            className="inline-flex min-h-[52px] w-full items-center justify-center rounded-[var(--radius-md)] border border-neutral-200 bg-white px-8 py-3.5 text-base font-medium text-neutral-600 sm:w-auto sm:min-w-[220px]"
                            aria-live="polite"
                        >
                            Загружаем профиль...
                        </div>
                    ) : null}
                </div>

                {!isBootstrapping && !user ? (
                    <p className="mt-5 text-sm text-neutral-500">
                        Уже зарегистрированы?{" "}
                        <Link
                            href="/auth/login"
                            className="font-semibold text-neutral-800 underline decoration-neutral-300 decoration-2 underline-offset-4 transition-colors hover:text-neutral-950 hover:decoration-[var(--color-brand-yellow)]"
                        >
                            Войти
                        </Link>
                    </p>
                ) : null}
            </div>

            <aside className="order-1 lg:order-2">
                <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-[var(--shadow-card)] sm:p-5">
                    <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-[linear-gradient(145deg,#fffbe8_0%,#fff_65%)] p-4 sm:p-6">
                        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[var(--color-brand-yellow)]/30 blur-xl" aria-hidden />
                        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-neutral-500">План первого запуска</p>
                        <ol className="mt-4 space-y-3">
                            {onboardingChecklist.map((item, idx) => (
                                <li key={item} className="flex items-start gap-3">
                                    <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white">
                                        {idx + 1}
                                    </span>
                                    <p className="text-sm leading-6 text-neutral-700">{item}</p>
                                </li>
                            ))}
                        </ol>
                        <div className="mt-4 grid grid-cols-2 gap-2">
                            <div className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-center">
                                <p className="text-xs text-neutral-500">Режим</p>
                                <p className="text-sm font-semibold text-neutral-800">Live</p>
                            </div>
                            <div className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-center">
                                <p className="text-xs text-neutral-500">Состояние</p>
                                <p className="text-sm font-semibold text-neutral-800">Автосохранение</p>
                            </div>
                        </div>
                    </div>
                    <p className="mt-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-600">
                        После входа вы всегда можете вернуться в каталог и продолжить с текущего шага.
                    </p>
                </div>
            </aside>
        </div>
    );
}
