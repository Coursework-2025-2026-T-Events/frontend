"use client";

import Link from "next/link";
import { ArrowRight, CalendarCheck, Check, GraduationCap, QrCode, Trophy } from "lucide-react";
import Typography from "@/components/ui/Typography";
import Button from "@/components/ui/Button";
import { useAuth } from "@/features/auth/AuthProvider";

const audienceCards = [
  {
    title: "Участникам",
    description: "Выбрать событие, пройти активности и увидеть прогресс.",
    icon: GraduationCap,
  },
  {
    title: "Организаторам",
    description: "Собрать программу, открыть регистрацию и управлять финалом.",
    icon: CalendarCheck,
  },
  {
    title: "Стойкам",
    description: "Сканировать QR и выдавать призы без ручных списков.",
    icon: QrCode,
  },
];

export default function HomeHero() {
  const { user, isBootstrapping } = useAuth();
  const showGuestCta = !isBootstrapping && !user;
  const showUserCta = !isBootstrapping && Boolean(user);
  const showBootstrapCta = isBootstrapping && !user;

  return (
    <div className="grid w-full gap-8 lg:grid-cols-[1.02fr,0.98fr] lg:items-center">
      <div>
        <p className="mb-5 inline-flex rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-[var(--color-brand-graphite)]">
          Платформа для образовательных событий
        </p>

        <Typography
          id="home-hero-heading"
          as="h1"
          size="inherit"
          weight="bold"
          className="max-w-3xl text-balance text-4xl leading-[1.04] text-[var(--color-brand-ink)] sm:text-5xl lg:text-[64px]"
        >
          Мероприятия, игры и награды в одном понятном маршруте
        </Typography>

        <Typography as="p" className="mt-5 max-w-2xl text-lg leading-8 text-[var(--color-brand-graphite)]">
          Дизайн T-Events теперь ближе к T-Образованию: крупные акценты, простая навигация по аудиториям и быстрый переход к действию.
        </Typography>

        <div className="mt-8 flex min-h-[52px] w-full max-w-md flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:items-center">
          {showUserCta ? (
            <Button href="/events" variant="dark" className="w-full px-8 py-3.5 text-base sm:w-auto">
              Продолжить участие
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Button>
          ) : null}

          {showGuestCta ? (
            <>
              <Button href="/auth/register" variant="dark" className="w-full px-8 py-3.5 text-base sm:w-auto">
                Начать
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Button>
              <Button href="/events" variant="secondary" className="w-full px-8 py-3.5 text-base sm:w-auto">
                Смотреть мероприятия
              </Button>
            </>
          ) : null}

          {showBootstrapCta ? (
            <Button href="/events" variant="dark" className="w-full px-8 py-3.5 text-base sm:w-auto">
              Смотреть мероприятия
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Button>
          ) : null}
        </div>

        {showBootstrapCta ? (
          <p className="mt-4 text-sm font-semibold text-[var(--color-brand-graphite)]" aria-live="polite">
            Проверяем профиль в фоне
          </p>
        ) : null}

        {!isBootstrapping && !user ? (
          <p className="mt-5 text-sm text-[var(--color-brand-graphite)]">
            Уже есть аккаунт?{" "}
            <Link
              href="/auth/login"
              className="font-semibold text-[var(--color-brand-ink)] underline decoration-black/25 decoration-2 underline-offset-4 transition-colors hover:decoration-black"
            >
              Войти
            </Link>
          </p>
        ) : null}
      </div>

      <aside>
        <div className="rounded-[var(--radius-lg)] border border-black/10 bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[var(--color-brand-muted)]">Активная программа</p>
              <Typography as="h2" size="xl" weight="bold" className="mt-2 leading-tight text-[var(--color-brand-ink)]">
                День открытых событий
              </Typography>
            </div>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-[var(--color-brand-yellow)] text-[var(--color-brand-ink)]">
              <Trophy className="h-6 w-6" aria-hidden />
            </span>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex justify-between text-xs font-semibold text-[var(--color-brand-muted)]">
              <span>Прогресс</span>
              <span>72%</span>
            </div>
            <div className="h-2 rounded-full bg-[var(--color-brand-panel)]">
              <div className="h-2 w-[72%] rounded-full bg-[var(--color-brand-yellow)]" />
            </div>
          </div>

          <div className="mt-6 grid gap-2">
            {["Регистрация завершена", "Квест запущен", "QR для награды готов"].map((item, index) => (
              <div key={item} className="flex items-center gap-3 border-t border-[var(--color-brand-line)] pt-3 first:border-t-0 first:pt-0">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-panel)] text-[var(--color-brand-ink)]">
                  <Check className="h-4 w-4" aria-hidden />
                </span>
                <span className="text-sm font-semibold text-[var(--color-brand-graphite)]">{item}</span>
                {index === 2 ? (
                  <span className="ml-auto rounded-full bg-[var(--color-brand-yellow)] px-2 py-1 text-xs font-bold text-[var(--color-brand-ink)]">
                    новый
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </aside>

      <div className="grid gap-3 md:grid-cols-3 lg:col-span-2">
        {audienceCards.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="flex min-h-[132px] items-start gap-4 rounded-[var(--radius-lg)] border border-black/10 bg-white/80 p-5 shadow-[var(--shadow-card)]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white text-[var(--color-brand-ink)]">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <Typography as="h3" size="md" weight="bold" className="text-[var(--color-brand-ink)]">
                  {item.title}
                </Typography>
                <Typography as="p" size="sm" className="mt-2 leading-6 text-[var(--color-brand-graphite)]">
                  {item.description}
                </Typography>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
