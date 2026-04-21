import Typography from "@/components/ui/Typography";

const steps = [
    {
        title: "Выберите мероприятие",
        description: "Откройте каталог и выберите формат, который подходит вашей команде прямо сейчас.",
        eta: "30–60 сек",
        icon: (
            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                    d="M7 12h10M9 9v6M15 10.5v3M6 7h12a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                />
            </svg>
        ),
    },
    {
        title: "Запустите активности",
        description: "Пройдите задания и мини-игры — баллы будут начисляться и сохраняться автоматически.",
        eta: "1–2 мин",
        icon: (
            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                    d="M4 19h16M7 16V8M12 16V5M17 16v-6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                />
            </svg>
        ),
    },
    {
        title: "Заберите приз",
        description: "Когда цель достигнута, оформите награду по готовому сценарию без ручных проверок.",
        eta: "до 1 мин",
        icon: (
            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                    d="M7 8h10v12H7zM7 8V6a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v2M4 8h16v4H4z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                />
            </svg>
        ),
    },
];

export default function HomeSteps() {
    return (
        <div className="w-full">
            <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
                <Typography
                    id="home-steps-heading"
                    as="h2"
                    size="xl"
                    weight="bold"
                    className="text-balance text-2xl tracking-tight text-neutral-900 sm:text-3xl"
                >
                    Первый проход по системе
                </Typography>
                <Typography as="p" className="mt-3 text-pretty text-neutral-600 sm:text-lg">
                    Процесс разбит на три коротких шага, чтобы вы быстро перешли от входа к результату.
                </Typography>
            </div>

            <ol className="grid list-none gap-5 p-0 sm:grid-cols-3 sm:gap-6">
                {steps.map((step, idx) => (
                    <li
                        key={step.title}
                        aria-label={`Шаг ${idx + 1}: ${step.title}`}
                        className="relative flex min-h-[250px] flex-col rounded-2xl border border-neutral-200/90 bg-[var(--color-brand-white)] p-6 text-left sm:min-h-[280px] sm:p-7"
                    >
                        <span className="absolute right-5 top-5 font-mono text-3xl font-bold leading-none text-neutral-100 sm:right-6 sm:top-6 sm:text-4xl">
                            {String(idx + 1).padStart(2, "0")}
                        </span>
                        <div
                            className="relative mb-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-brand-yellow)] text-[var(--color-brand-black)] shadow-sm sm:mb-5 sm:h-14 sm:w-14"
                            aria-hidden="true"
                        >
                            {step.icon}
                        </div>
                        <Typography as="h3" size="lg" weight="bold" className="relative text-neutral-900">
                            {step.title}
                        </Typography>
                        <p className="relative mt-2 text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">
                            Время: {step.eta}
                        </p>
                        <Typography as="p" size="sm" className="relative mt-2 leading-relaxed text-neutral-600">
                            {step.description}
                        </Typography>
                    </li>
                ))}
            </ol>
        </div>
    );
}
