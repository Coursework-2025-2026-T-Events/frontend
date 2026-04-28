"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/features/auth/AuthProvider";
import { routes } from "@/lib/routes";

const primaryButtonClassName =
  "inline-flex min-h-12 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-brand-yellow)] px-6 py-3 text-[15px] font-normal leading-5 text-[var(--color-brand-ink)] transition hover:bg-[var(--color-brand-yellow-hover)]";

const secondaryButtonClassName =
  "inline-flex min-h-12 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-brand-line)] bg-white px-6 py-3 text-[15px] font-normal leading-5 text-[var(--color-brand-ink)] transition hover:bg-[var(--color-brand-panel)]";

export default function HomeHeroActions() {
  const { user, isBootstrapping } = useAuth();

  return (
    <div className="mt-8 flex min-h-12 flex-col justify-center gap-3 sm:flex-row">
      <Link href={routes.events} className={primaryButtonClassName}>
        Смотреть мероприятия
        <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
      </Link>

      {!user ? (
        <Link
          href={routes.login}
          aria-disabled={isBootstrapping}
          className={[
            secondaryButtonClassName,
            isBootstrapping ? "pointer-events-none text-[var(--color-brand-muted)]" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {isBootstrapping ? "Проверяем профиль" : "Войти в профиль"}
        </Link>
      ) : null}
    </div>
  );
}
