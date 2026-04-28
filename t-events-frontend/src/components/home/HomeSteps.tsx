import { BadgeCheck, MousePointerClick, Trophy } from "lucide-react";
import Typography from "@/components/ui/Typography";

const steps = [
  {
    title: "Выберите событие",
    description: "Каталог показывает актуальные программы и оставляет только понятные действия.",
    eta: "30-60 сек",
    icon: MousePointerClick,
  },
  {
    title: "Пройдите активности",
    description: "Игры, задания и прогресс собраны в одном маршруте без лишних переходов.",
    eta: "1-2 мин",
    icon: BadgeCheck,
  },
  {
    title: "Получите награду",
    description: "QR и статус участия помогают быстро подтвердить результат на стойке.",
    eta: "до 1 мин",
    icon: Trophy,
  },
];

export default function HomeSteps() {
  return (
    <div className="w-full">
      <div className="mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <Typography
            id="home-steps-heading"
            as="h2"
            size="inherit"
            weight="bold"
            className="text-balance text-3xl leading-tight text-[var(--color-brand-ink)] sm:text-4xl"
          >
            Как устроен маршрут
          </Typography>
          <Typography as="p" className="mt-3 text-pretty text-base leading-7 text-[var(--color-brand-muted)] sm:text-lg">
            Как на T-Образовании, путь разбит на короткие понятные блоки: пользователь всегда видит, где он находится и что будет дальше.
          </Typography>
        </div>
        <span className="w-fit rounded-full bg-[var(--color-brand-yellow)] px-4 py-2 text-sm font-semibold text-[var(--color-brand-ink)]">
          3 шага до результата
        </span>
      </div>

      <ol className="grid list-none gap-4 p-0 md:grid-cols-3">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <li
              key={step.title}
              aria-label={`Шаг ${idx + 1}: ${step.title}`}
              className="relative flex min-h-[250px] flex-col rounded-[var(--radius-lg)] border border-[var(--color-brand-line)] bg-white p-6 shadow-[var(--shadow-card)]"
            >
              <span className="mb-7 text-sm font-bold text-[var(--color-brand-muted)]">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-md bg-[var(--color-brand-yellow)] text-[var(--color-brand-ink)]">
                <Icon className="h-6 w-6" aria-hidden />
              </span>
              <Typography as="h3" size="lg" weight="bold" className="text-[var(--color-brand-ink)]">
                {step.title}
              </Typography>
              <Typography as="p" size="sm" className="mt-3 leading-6 text-[var(--color-brand-muted)]">
                {step.description}
              </Typography>
              <p className="mt-auto pt-5 text-xs font-semibold uppercase text-[var(--color-brand-muted)]">
                {step.eta}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
