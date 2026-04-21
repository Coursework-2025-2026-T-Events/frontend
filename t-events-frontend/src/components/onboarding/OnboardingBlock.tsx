import Link from "next/link";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Typography from "@/components/ui/Typography";

export default function OnboardingBlock() {
  return (
    <div className="bg-[#F5F6F8]">
      {/* 1) Навигация (стиль Т-Банка) */}
      <header className="border-b border-neutral-200 bg-white">
        <Container>
          <div className="flex h-16 items-center justify-between">
            <div className="text-lg font-bold">T‑Events</div>

            <nav className="hidden gap-6 text-sm text-neutral-700 md:flex">
              <Link className="hover:text-black" href="/events">
                Мероприятия
              </Link>
              <Link className="hover:text-black" href="/auth/login">
                Вход
              </Link>
              <Link className="hover:text-black" href="/auth/register">
                Регистрация
              </Link>
            </nav>

            <div className="flex items-center gap-2">
              <Button href="/auth/login" variant="secondary">Войти</Button>
            </div>
          </div>
        </Container>
      </header>

      {/* 2) Primary + secondary header */}
      <section className="pt-10">
        <Container>
          <div className="mx-auto max-w-[760px] text-center">
            <Typography as="h1" size="2xl" weight="bold">
              T‑Events
            </Typography>
            <Typography className="mt-3 text-neutral-600" size="sm">
              Ты здесь, потому что любишь крутые призы и формат событий с активностями.
            </Typography>
          </div>
        </Container>
      </section>

      {/* 3) Блок с иллюстрацией + шаги */}
      <section className="mt-10 pb-16">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-start">
            {/* Иллюстрация */}
            <div className="rounded-[28px] bg-white p-6 shadow-sm">
              <div className="text-center text-xl font-semibold">T‑Events</div>
              <p className="mt-2 text-center text-sm text-neutral-600">
                Ты здесь, потому что любишь крутые подарки
              </p>

              <div className="mt-6 flex h-[160px] items-center justify-center rounded-2xl bg-[var(--color-brand-yellow)]/80 text-sm font-medium text-neutral-700">
                Здесь красивая картинка
              </div>

              <p className="mt-6 text-center text-sm text-neutral-600">
                Придерживайся чёткого плана:
              </p>
            </div>

            {/* Шаги 1-2-3 */}
            <div className="rounded-[28px] bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between rounded-2xl bg-[var(--color-brand-yellow)]/80 p-4">
                  <div className="text-base font-semibold">Играй</div>
                  <span>🎮</span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-[var(--color-brand-yellow)]/80 p-4">
                  <div className="text-base font-semibold">Зарабатывай баллы</div>
                  <span>📈</span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-[var(--color-brand-yellow)]/80 p-4">
                  <div className="text-base font-semibold">Получай призы!</div>
                  <span>🎁</span>
                </div>
              </div>

              {/* 4) CTA */}
              <div className="mt-6 flex justify-center">
                <Button href="/events">Погнали</Button>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}