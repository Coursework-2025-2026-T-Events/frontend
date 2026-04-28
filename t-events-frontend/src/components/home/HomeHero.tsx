"use client";

import Link from "next/link";
import Typography from "@/components/ui/Typography";
import Button from "@/components/ui/Button";
import { useAuth } from "@/features/auth/AuthProvider";

export default function HomeHero() {
    const { user, isBootstrapping } = useAuth();
    const showGuestCta = !isBootstrapping && !user;
    const showUserCta = !isBootstrapping && Boolean(user);
    const checklist = user
        ? ["Откройте активное мероприятие", "Продолжите прогресс с последнего шага", "Завершите сценарий и получите награду"]
        : ["Создайте аккаунт", "Выберите мероприятие", "Запустите активность и сохраняйте прогресс автоматически"];

    return (
        <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1.08fr,0.92fr] lg:items-center lg:gap-10">
            <div className="order-2 lg:order-1">
                <p className="mb-5 inline-flex items-center rounded-full border border-neutral-300 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-600">
                    Новый поток запуска
                </p>

                <Typography
                    id="home-hero-heading"
                    as="h1"
                    size="2xl"
                    weight="bold"
                    className="text-balance text-4xl leading-[1.06] tracking-tight text-[var(--color-brand-ink)] sm:text-5xl lg:text-[3.3rem]"
                >
                    Стартуйте в T‑Events
                    <span className="block text-neutral-500">и получите результат за несколько минут</span>
                </Typography>

                <Typography as="p" className="mt-5 max-w-xl text-base leading-relaxed text-neutral-700 sm:text-lg">
                    Единый маршрут от регистрации до награды: без лишних экранов, с автоматическим сохранением и понятными шагами на каждом этапе.
                </Typography>

                <div className="mt-7 grid max-w-lg grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-3">
                        <p className="text-xl font-bold text-[var(--color-brand-ink)]">3 шага</p>
                        <p className="mt-1 text-xs text-neutral-600">от входа до финиша</p>
                    </div>
                    <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-3">
                        <p className="text-xl font-bold text-[var(--color-brand-ink)]">2-3 мин</p>
                        <p className="mt-1 text-xs text-neutral-600">на первый проход</p>
                    </div>
                </div>

                <div className="mt-8 flex min-h-[52px] w-full max-w-md flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:items-center">
                    {showUserCta ? (
                        <Button href="/events" className="w-full px-8 py-3.5 text-base font-semibold sm:w-auto sm:min-w-[220px]">
                            Продолжить участие
                        </Button>
                    ) : null}

                    {showGuestCta ? (
                        <>
                            <Button href="/auth/register" className="w-full px-8 py-3.5 text-base font-semibold sm:w-auto sm:min-w-[220px]">
                                Начать знакомство
                            </Button>
                            <Button href="/events" variant="secondary" className="w-full px-8 py-3.5 text-base font-semibold sm:w-auto sm:min-w-[220px]">
                                Каталог мероприятий
                            </Button>
                        </>
                    ) : null}

                    {isBootstrapping ? (
                        <div
                            className="inline-flex min-h-[52px] w-full items-center justify-center rounded-[var(--radius-md)] border border-neutral-200 bg-white px-8 py-3.5 text-base font-medium text-neutral-600 sm:w-auto sm:min-w-[220px]"
                            aria-live="polite"
                        >
                            Проверяем профиль...
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
                <div className="relative overflow-hidden rounded-[28px] border border-neutral-200 bg-[linear-gradient(160deg,#ffffff_0%,#fff4ba_100%)] p-5 shadow-[var(--shadow-card)] sm:p-6">
                    <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/60 blur-2xl" aria-hidden />
                    <div className="absolute -left-8 bottom-1 h-20 w-20 rounded-full bg-[var(--color-brand-yellow)]/30 blur-xl" aria-hidden />

                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-neutral-600">Маршрут пользователя</p>
                    <ol className="mt-5 space-y-3">
                        {checklist.map((item, idx) => (
                            <li key={item} className="flex items-start gap-3 rounded-xl bg-white/80 px-3 py-2.5">
                                <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white">
                                    {idx + 1}
                                </span>
                                <p className="text-sm leading-6 text-neutral-700">{item}</p>
                            </li>
                        ))}
                    </ol>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                        <div className="rounded-xl border border-neutral-200 bg-white/90 px-3 py-2 text-center">
                            <p className="text-xs text-neutral-500">Режим</p>
                            <p className="text-sm font-semibold text-neutral-800">Активен</p>
                        </div>
                        <div className="rounded-xl border border-neutral-200 bg-white/90 px-3 py-2 text-center">
                            <p className="text-xs text-neutral-500">Прогресс</p>
                            <p className="text-sm font-semibold text-neutral-800">Автосохранение</p>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    );
}
