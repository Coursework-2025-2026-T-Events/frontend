import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import Typography from "@/components/ui/Typography";
import HomeCTA from "@/components/home/HomeCTA";
import HomeHero from "@/components/home/HomeHero";
import HomeHighlights from "@/components/home/HomeHighlights";
import HomeSteps from "@/components/home/HomeSteps";

export const metadata: Metadata = {
    title: "T‑Events — onboarding и первый запуск",
    description:
        "Экран первого входа в T‑Events: быстрый запуск, понятные шаги и доступ к мероприятиям без лишних действий.",
};

export default function Home() {
    return (
        <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-[var(--color-brand-white)]">
            <section
                className="border-b border-neutral-200 bg-[linear-gradient(180deg,#fffdf4_0%,#ffffff_75%)] pt-10 pb-12 sm:pt-14 sm:pb-14"
                aria-labelledby="home-hero-heading"
            >
                <Container className="w-full">
                    <HomeHero />
                </Container>
            </section>

            <section
                className="border-y border-neutral-200 bg-neutral-50/60 py-12 sm:py-14"
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
                            className="text-balance text-2xl tracking-tight text-neutral-900 sm:text-3xl"
                        >
                            Что дает такой формат запуска
                        </Typography>
                        <Typography as="p" className="mt-3 text-pretty text-neutral-600 sm:text-lg">
                            Главные преимущества собраны в одной ленте: легко понять сценарий и быстро перейти к действию.
                        </Typography>
                    </div>
                    <HomeHighlights />
                </Container>
            </section>

            <section className="py-12 sm:py-14" aria-labelledby="home-cta-heading">
                <Container>
                    <HomeCTA />
                </Container>
            </section>
        </div>
    );
}
