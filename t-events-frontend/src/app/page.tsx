import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import Typography from "@/components/ui/Typography";
import HomeCTA from "@/components/home/HomeCTA";
import HomeHero from "@/components/home/HomeHero";
import HomeHighlights from "@/components/home/HomeHighlights";
import HomeSteps from "@/components/home/HomeSteps";

export const metadata: Metadata = {
    title: "T‑Events — знакомство и первый запуск",
    description:
        "Экран первого входа в T‑Events: быстрый запуск, понятные шаги и доступ к мероприятиям без лишних действий.",
};

export default function Home() {
    return (
        <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-[linear-gradient(180deg,#fffef8_0%,#ffffff_35%,#f6f7fb_100%)]">
            <section
                className="relative overflow-hidden border-b border-neutral-200/80 pt-10 pb-12 sm:pt-14 sm:pb-14"
                aria-labelledby="home-hero-heading"
            >
                <div className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-full">
                    <div className="absolute -left-24 top-10 h-56 w-56 rounded-full bg-[var(--color-brand-yellow)]/25 blur-3xl" aria-hidden />
                    <div className="absolute right-0 top-24 h-44 w-44 rounded-full bg-[#dfe6ff]/40 blur-3xl" aria-hidden />
                </div>
                <Container className="w-full">
                    <HomeHero />
                </Container>
            </section>

            <section
                className="border-y border-neutral-200/80 bg-[var(--color-brand-mist)]/65 py-12 sm:py-14"
                aria-labelledby="home-steps-heading"
            >
                <Container>
                    <HomeSteps />
                </Container>
            </section>

            <section className="py-12 sm:py-14" aria-labelledby="home-highlights-heading">
                <Container>
                    <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
                        <Typography
                            id="home-highlights-heading"
                            as="h2"
                            size="xl"
                            weight="bold"
                            className="text-balance text-2xl tracking-tight text-[var(--color-brand-ink)] sm:text-3xl"
                        >
                            Почему этот формат работает
                        </Typography>
                        <Typography as="p" className="mt-3 text-pretty text-neutral-600 sm:text-lg">
                            Главные эффекты вынесены в отдельные карточки, чтобы вы сразу увидели ценность и ожидаемый результат.
                        </Typography>
                    </div>
                    <HomeHighlights />
                </Container>
            </section>

            <section className="pb-12 pt-4 sm:pb-16 sm:pt-6" aria-labelledby="home-cta-heading">
                <Container>
                    <HomeCTA />
                </Container>
            </section>
        </div>
    );
}
