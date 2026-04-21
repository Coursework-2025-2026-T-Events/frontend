import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default function HomeHeader() {
  return (
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

          <Button href="/auth/login" variant="secondary">
            Войти
          </Button>
        </div>

        <div className="flex gap-4 pb-3 text-sm text-neutral-700 md:hidden">
          <Link className="hover:text-black" href="/events">
            Мероприятия
          </Link>
          <Link className="hover:text-black" href="/auth/login">
            Вход
          </Link>
          <Link className="hover:text-black" href="/auth/register">
            Регистрация
          </Link>
        </div>
      </Container>
    </header>
  );
}