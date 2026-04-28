import { ChartNoAxesColumnIncreasing, ListChecks, ShieldCheck } from "lucide-react";
import Typography from "@/components/ui/Typography";

const highlights = [
  {
    title: "Каталог вместо хаоса",
    description: "События выглядят как образовательные программы: статус, описание и следующий шаг считываются сразу.",
    proof: "Быстрый выбор",
    icon: ListChecks,
  },
  {
    title: "Прогресс прозрачен",
    description: "Баллы и этапы фиксируются автоматически, поэтому участникам и организаторам не нужны ручные сверки.",
    proof: "Единое состояние",
    icon: ChartNoAxesColumnIncreasing,
  },
  {
    title: "Финиш управляем",
    description: "QR, роли и выдачи отделены от общего каталога, чтобы стойки работали быстро даже на потоке.",
    proof: "Меньше очередей",
    icon: ShieldCheck,
  },
];

export default function HomeHighlights() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {highlights.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.title}
            className="group flex h-full flex-col rounded-[var(--radius-lg)] border border-[var(--color-brand-line)] bg-white p-6 shadow-[var(--shadow-card)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]"
          >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-md bg-[var(--color-brand-panel)] text-[var(--color-brand-ink)]">
              <Icon className="h-6 w-6" aria-hidden />
            </div>
            <Typography as="h3" size="lg" weight="bold" className="text-[var(--color-brand-ink)]">
              {item.title}
            </Typography>
            <Typography as="p" size="sm" className="mt-3 leading-6 text-[var(--color-brand-muted)]">
              {item.description}
            </Typography>
            <p className="mt-6 w-fit rounded-full bg-[var(--color-brand-panel)] px-3 py-1 text-xs font-semibold text-[var(--color-brand-graphite)]">
              {item.proof}
            </p>
          </div>
        );
      })}
    </div>
  );
}
