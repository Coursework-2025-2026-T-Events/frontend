import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Container from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Т-Мероприятия - образовательные мероприятия",
  description: "Т-Мероприятия помогают школьникам выбрать мероприятие, пройти активности и получить награду.",
};

const heroSteps = [
  {
    eyebrow: "Каталог событий",
    title: "Выбирайте мероприятие",
    text: "Откройте каталог мероприятий и выберите то, в котором принимаете участие.",
    image: "/images/step-choose-event.png",
    alt: "Календарь, билет и чек-лист для выбора образовательного мероприятия",
  },
  {
    eyebrow: "Игровой маршрут",
    title: "Участвуйте в играх",
    text: "Проходите задания, мини-игры и следите за своим прогрессом.",
    image: "/images/step-play-games.png",
    alt: "Игровой экран с заданиями, кубком и элементами прогресса",
  },
  {
    eyebrow: "Приз за финиш",
    title: "Получайте призы",
    text: "Наберите необходимое количество баллов и покажите QR для получения приза на стойке выдачи.",
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
              className="text-balance text-[36px] font-bold leading-10 text-[var(--color-brand-ink)] sm:text-[44px] sm:leading-[48px]"
            >
              Т-Мероприятия
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-[15px] leading-6 text-[var(--color-brand-graphite)]">
              Вы здесь, потому что любите крутые призы! Проявляйте себя, участвуя в играх, и получайте награды за баллы.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/events"
                className="inline-flex min-h-12 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-brand-yellow)] px-6 py-3 text-[15px] font-normal leading-5 text-[var(--color-brand-ink)] transition hover:bg-[var(--color-brand-yellow-hover)]"
              >
                Смотреть мероприятия
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex min-h-12 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-brand-line)] bg-white px-6 py-3 text-[15px] font-normal leading-5 text-[var(--color-brand-ink)] transition hover:bg-[var(--color-brand-panel)]"
              >
                Войти в профиль
              </Link>
            </div>
          </div>

          <div className="mx-auto mt-12 flex max-w-5xl flex-col gap-6" aria-label="Путь участника">
            {heroSteps.map((step, index) => {
              const isReversed = index % 2 === 1;

              return (
                <article
                  key={step.title}
                  className="relative grid overflow-hidden rounded-[var(--radius-lg)] border border-white bg-white shadow-[var(--shadow-card)] md:grid-cols-2"
                >
                  <div
                    className={[
                      "relative h-60 overflow-hidden bg-[var(--color-brand-panel)] sm:h-72 md:h-auto md:min-h-[21rem]",
                      isReversed ? "md:order-2" : "",
                    ].join(" ")}
                  >
                    <Image
                      src={step.image}
                      alt={step.alt}
                      width={1254}
                      height={1254}
                      priority
                      unoptimized
                      className="absolute inset-0 h-full w-full scale-[1.04] object-cover"
                    />
                    <div
                      className={[
                        "pointer-events-none absolute inset-y-0 hidden w-16 bg-gradient-to-r from-white to-transparent md:block",
                        isReversed ? "left-0" : "right-0 rotate-180",
                      ].join(" ")}
                      aria-hidden
                    />
                  </div>

                  <div className="relative flex h-80 flex-col justify-center p-6 pb-14 sm:h-80 sm:p-8 sm:pb-16 md:h-auto md:min-h-[21rem] md:p-10 md:pb-18">
                    <div className="mb-6 flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-brand-yellow)] text-[13px] font-bold leading-[18px] text-[var(--color-brand-ink)]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="rounded-full bg-[var(--color-brand-panel)] px-4 py-2 text-[13px] font-normal leading-[18px] text-[var(--color-brand-graphite)]">
                        {step.eyebrow}
                      </span>
                    </div>

                    <h2 className="max-w-md text-[24px] font-medium leading-7 text-[var(--color-brand-ink)]">
                      {step.title}
                    </h2>
                    <p className="mt-4 max-w-md text-[15px] leading-6 text-[var(--color-brand-graphite)]">
                      {step.text}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="py-12 sm:py-16">
        <Container>
          <div className="rounded-[var(--radius-lg)] bg-white p-6 text-center shadow-[var(--shadow-card)] sm:p-8">
            <h2 className="text-balance text-[32px] font-bold leading-9 text-[var(--color-brand-ink)] sm:text-[44px] sm:leading-[48px]">
              Начните с выбора мероприятия
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-6 text-[var(--color-brand-muted)]">
              Каталог покажет доступные события и поможет перейти к участию.
            </p>
            <Link
              href="/events"
              className="mt-7 inline-flex min-h-12 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-brand-yellow)] px-6 py-3 text-[15px] font-normal leading-5 text-[var(--color-brand-ink)] transition hover:bg-[var(--color-brand-yellow-hover)]"
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
