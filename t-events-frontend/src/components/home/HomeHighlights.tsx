import Typography from "@/components/ui/Typography";

const highlights = [
    {
        title: "Понятный первый экран",
        description: "Сразу видно, что делать дальше: начать onboarding, открыть каталог или войти в профиль.",
        proof: "Меньше ошибок на старте",
        icon: (
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                    d="M4 6h16M4 12h10M4 18h7"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                />
            </svg>
        ),
    },
    {
        title: "Прозрачный прогресс",
        description: "Баллы и шаги фиксируются автоматически, поэтому не нужно вести таблицы вручную.",
        proof: "Единый источник состояния",
        icon: (
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                    d="M12 3v18M8 8h8M8 16h8"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                />
            </svg>
        ),
    },
    {
        title: "Управляемый финиш",
        description: "Когда цель достигнута, выдача награды проходит по готовому процессу без ручного подсчёта.",
        proof: "Предсказуемый результат",
        icon: (
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                    d="M12 15l-2.3 1.2.4-2.6-1.9-1.8 2.6-.4L12 9l1.2 2.4 2.6.4-1.9 1.8.4 2.6L12 15z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                />
                <path d="M5 19h14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
        ),
    },
];

export default function HomeHighlights() {
    return (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
            {highlights.map((item) => (
                <div
                    key={item.title}
                    className="group flex h-full flex-col rounded-2xl border border-neutral-200 bg-[var(--color-brand-white)] p-6 transition-transform duration-200 hover:-translate-y-0.5"
                >
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-brand-yellow)]/90 text-[var(--color-brand-black)] sm:h-11 sm:w-11">
                        {item.icon}
                    </div>
                    <Typography as="h3" size="lg" weight="bold" className="text-neutral-900">
                        {item.title}
                    </Typography>
                    <Typography as="p" size="sm" className="mt-2 leading-relaxed text-neutral-600">
                        {item.description}
                    </Typography>
                    <p className="mt-4 inline-flex w-fit items-center rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-600">
                        {item.proof}
                    </p>
                </div>
            ))}
        </div>
    );
}
