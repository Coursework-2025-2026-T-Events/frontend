"use client";

import { ArrowRight } from "lucide-react";
import Typography from "@/components/ui/Typography";
import Button from "@/components/ui/Button";
import { useAuth } from "@/features/auth/AuthProvider";

export default function HomeCTA() {
  const { user, isBootstrapping } = useAuth();
  const showRegistration = !isBootstrapping && !user;
  const showBootstrapCatalog = isBootstrapping && !user;

  const title = user ? "Продолжайте с того же места" : "Запустите первый сценарий";
  const body = user
    ? "Каталог, активное участие и награды собраны в навигации. Вернитесь к событию без поиска нужного экрана."
    : "Создайте аккаунт или откройте каталог, чтобы увидеть доступные мероприятия и пройти маршрут до награды.";

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-brand-line)] bg-white px-6 py-8 shadow-[var(--shadow-card)] sm:px-8 sm:py-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <span className="mb-4 inline-flex rounded-full bg-[var(--color-brand-yellow)] px-3 py-1 text-xs font-bold text-[var(--color-brand-ink)]">
            следующий шаг
          </span>
          <Typography
            id="home-cta-heading"
            as="h2"
            size="inherit"
            weight="bold"
            className="text-balance text-3xl leading-tight text-[var(--color-brand-ink)] sm:text-4xl"
          >
            {title}
          </Typography>
          <Typography as="p" className="mt-3 text-pretty text-base leading-7 text-[var(--color-brand-muted)] sm:text-lg">
            {body}
          </Typography>
        </div>

        {!isBootstrapping || showBootstrapCatalog ? (
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              href={user ? "/events" : showBootstrapCatalog ? "/events" : "/auth/register"}
              className="min-h-[52px] px-8 py-3.5 text-base"
            >
              {user ? "Открыть мероприятия" : showBootstrapCatalog ? "Открыть каталог" : "Начать"}
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Button>
            {showRegistration ? (
              <Button href="/events" variant="secondary" className="min-h-[52px] px-8 py-3.5 text-base">
                Каталог
              </Button>
            ) : null}
          </div>
        ) : (
          <p className="text-sm font-semibold text-[var(--color-brand-muted)]" aria-live="polite">
            Определяем статус пользователя...
          </p>
        )}
      </div>
    </div>
  );
}
