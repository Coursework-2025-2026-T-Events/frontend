"use client";

import Typography from "@/components/ui/Typography";
import Button from "@/components/ui/Button";
import { useAuth } from "@/features/auth/AuthProvider";

export default function HomeCTA() {
    const { user, isBootstrapping } = useAuth();
    const showRegistration = !isBootstrapping && !user;
    const showActionButtons = !isBootstrapping;

    const title = user ? "Продолжайте путь без потери прогресса" : "Готовы запустить первый сценарий?";
    const body = user
        ? "Откройте каталог, перейдите в активное мероприятие и завершите текущие шаги в том же темпе."
        : "Создайте аккаунт и начните знакомство с сервисом: это основной маршрут для быстрого и предсказуемого старта.";

    return (
        <div className="relative overflow-hidden rounded-[28px] border border-neutral-200 bg-[linear-gradient(160deg,#ffffff_0%,#fff2b0_120%)] px-6 py-8 sm:px-8 sm:py-10">
            <div className="pointer-events-none absolute -left-8 -top-10 h-32 w-32 rounded-full bg-white/60 blur-2xl" aria-hidden />
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
                <div className="max-w-xl">
                    <Typography
                        id="home-cta-heading"
                        as="h2"
                        size="xl"
                        weight="bold"
                        className="text-balance text-2xl tracking-tight text-[var(--color-brand-ink)] sm:text-3xl"
                    >
                        {title}
                    </Typography>
                    <Typography as="p" className="mt-3 text-pretty text-base leading-relaxed text-neutral-600 sm:text-lg">
                        {body}
                    </Typography>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-neutral-600">
                        <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1">Шаги занимают несколько минут</span>
                        <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1">Можно продолжить в любое время</span>
                    </div>
                </div>

                {showActionButtons ? (
                    <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center">
                        <Button
                            href={user ? "/events" : "/auth/register"}
                            className="min-h-[48px] px-8 py-3.5 text-base font-semibold"
                        >
                            {user ? "Открыть мероприятия" : "Начать знакомство"}
                        </Button>
                        {showRegistration ? (
                            <Button
                                href="/events"
                                variant="secondary"
                                className="min-h-[48px] px-8 py-3.5 text-base font-semibold text-neutral-900"
                            >
                                Каталог мероприятий
                            </Button>
                        ) : null}
                    </div>
                ) : (
                    <p className="text-sm font-medium text-neutral-600" aria-live="polite">Определяем ваш статус пользователя...</p>
                )}
            </div>
        </div>
    );
}
