import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[var(--color-brand-mist)]">
      <Container>
        <section className="mx-auto flex min-h-[420px] max-w-2xl flex-col items-start justify-center py-16">
          <span className="inline-flex rounded-full bg-[var(--color-brand-yellow)] px-3 py-1 text-[13px] font-medium leading-[18px] text-[var(--color-brand-ink)]">
            404
          </span>
          <h1 className="mt-5 text-[32px] font-bold leading-10 text-[var(--color-brand-ink)] sm:text-[44px] sm:leading-[48px]">
            Страница не найдена
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-6 text-[var(--color-brand-graphite)]">
            Возможно, ссылка устарела или раздел был перемещен. Вернитесь к мероприятиям и продолжите оттуда.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button href="/events">К мероприятиям</Button>
            <Button href="/" variant="secondary">
              На главную
            </Button>
          </div>
        </section>
      </Container>
    </div>
  );
}
