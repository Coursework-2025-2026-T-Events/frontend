import Container from "@/components/ui/Container";
import LoadingState from "@/components/ui/LoadingState";

export default function Loading() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[var(--color-brand-mist)]">
      <Container>
        <div className="flex min-h-[360px] items-center justify-center py-16">
          <LoadingState message="Загружаем раздел..." />
        </div>
      </Container>
    </div>
  );
}
