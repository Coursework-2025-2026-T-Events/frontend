"use client";

import Typography from "@/components/ui/Typography";
import Button from "@/components/ui/Button";
import { useAuth } from "@/features/auth/AuthProvider";

export default function HomeCTA() {
    const { user, isBootstrapping } = useAuth();
    const showRegistration = !isBootstrapping && !user;
    const showActionButtons = !isBootstrapping;

    const title = user ? "Продолжайте с текущего шага" : "Готовы начать первый проход?";
    const body = user
        ? "Профиль загружен: переходите в каталог и завершайте начатые активности."
        : "Создайте аккаунт, выберите мероприятие и пройдите первый сценарий без ручной настройки.";

    return (
        <div className="rounded-2xl border border-neutral-200 bg-white px-6 py-8 sm:px-8 sm:py-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
                <div className="max-w-xl">
                    <Typography
                        id="home-cta-heading"
                        as="h2"
                        size="xl"
                        weight="bold"
                        className="text-balance text-2xl tracking-tight text-neutral-900 sm:text-3xl"
                    >
                        {isBootstrapping ? "Почти готово…" : title}
                    </Typography>
                    <Typography as="p" className="mt-3 text-pretty text-base leading-relaxed text-neutral-600 sm:text-lg">
                        {isBootstrapping ? "Загружаем ваш профиль." : body}
                    </Typography>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-neutral-600">
                        <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1">Шаги занимают несколько минут</span>
                        <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1">Можно продолжить в любое время</span>
                    </div>
                </div>

                {showActionButtons ? (
                    <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center">
                        <Button
                            href="/events"
                            className="min-h-[48px] px-8 py-3.5 text-base font-semibold"
                        >
                            {user ? "Перейти к мероприятиям" : "Открыть каталог"}
                        </Button>
                        {showRegistration ? (
                            <Button
                                href="/auth/register"
                                variant="secondary"
                                className="min-h-[48px] border-neutral-300 bg-white px-8 py-3.5 text-base font-semibold text-neutral-900 hover:bg-neutral-50"
                            >
                                Регистрация
                            </Button>
                        ) : null}
                    </div>
                ) : (
                    <div
                        className="inline-flex min-h-[48px] items-center justify-center rounded-[var(--radius-md)] border border-neutral-200 bg-white px-8 py-3.5 text-base font-medium text-neutral-600"
                        aria-live="polite"
                    >
                        Загружаем профиль...
                    </div>
                )}
            </div>
        </div>
    );
}
