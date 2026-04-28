import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Container from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "T-Events - образовательные мероприятия",
  description: "T-Events помогает школьникам выбрать мероприятие, пройти активности и получить награду.",
};

const heroSteps = [
  {
    title: "Выбирайте мероприятие",
    text: "Откройте каталог и найдите событие, в котором хочется участвовать.",
    image: "/images/step-choose-event.png",
    alt: "Календарь, билет и чек-лист для выбора образовательного мероприятия",
  },
  {
    title: "Участвуйте в играх",
    text: "Проходите задания, мини-игры и следите за своим прогрессом.",
    image: "/images/step-play-games.png",
    alt: "Игровой экран с заданиями, кубком и элементами прогресса",
  },
  {
    title: "Получайте призы",
    text: "Дойдите до финиша и покажите QR на стойке выдачи.",
    image: "/images/step-get-prize.png",
    alt: "Подарок, QR-код и медаль для получения приза",
  },
];

export default function Home() {
  return (
    <div className="bg-[var(--color-brand-mist)]">
      <section className="pt-14 pb-12 sm:pt-20 sm:pb-16" aria-labelledby="home-heading">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h1
              id="home-heading"
              className="text-balance text-4xl font-bold leading-tight text-[var(--color-brand-ink)] sm:text-6xl"
            >
              T-Events
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-7 text-[var(--color-brand-graphite)] sm:text-xl sm:leading-8">
              Выбирайте образовательные мероприятия, проходите игровые задания и забирайте призы за результат.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/events"
                className="inline-flex min-h-12 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-brand-yellow)] px-6 py-3 text-base font-semibold text-[var(--color-brand-ink)] transition hover:bg-[var(--color-brand-yellow-hover)]"
              >
                Смотреть мероприятия
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex min-h-12 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-brand-line)] bg-white px-6 py-3 text-base font-semibold text-[var(--color-brand-ink)] transition hover:bg-[var(--color-brand-panel)]"
              >
                Войти в профиль
              </Link>
            </div>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3" aria-label="Путь участника">
            {heroSteps.map((step, index) => (
              <article
                key={step.title}
                className="overflow-hidden rounded-[var(--radius-lg)] bg-white shadow-[var(--shadow-card)]"
              >
                <div className="bg-[var(--color-brand-panel)]">
                  <Image
                    src={step.image}
                    alt={step.alt}
                    width={1254}
                    height={1254}
                    priority={index === 0}
                    unoptimized
                    className="h-56 w-full object-cover sm:h-64 md:h-52 lg:h-60"
                  />
                </div>
                <div className="p-6">
                  <p className="text-sm font-bold text-[var(--color-brand-muted)]">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h2 className="mt-3 text-2xl font-bold leading-tight text-[var(--color-brand-graphite)]">
                    {step.title}
                  </h2>
                  <p className="mt-3 text-base leading-7 text-[var(--color-brand-graphite)]">{step.text}</p>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-12 sm:py-16">
        <Container>
          <div className="rounded-[var(--radius-lg)] bg-white p-6 text-center shadow-[var(--shadow-card)] sm:p-8">
            <h2 className="text-balance text-3xl font-bold leading-tight text-[var(--color-brand-ink)] sm:text-4xl">
              Начните с выбора мероприятия
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-[var(--color-brand-muted)]">
              Каталог покажет доступные события и поможет перейти к участию.
            </p>
            <Link
              href="/events"
              className="mt-7 inline-flex min-h-12 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-brand-yellow)] px-6 py-3 text-base font-semibold text-[var(--color-brand-ink)] transition hover:bg-[var(--color-brand-yellow-hover)]"
            >
              Открыть каталог
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
          </div>
        </Container>
      </section>
    </div>
  );
}
