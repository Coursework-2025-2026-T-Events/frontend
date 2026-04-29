import Container from "@/components/ui/Container";
import LoadingState from "@/components/ui/LoadingState";

type Props = {
  message?: string;
};

export default function SegmentLoading({ message = "Загружаем раздел..." }: Props) {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[var(--color-brand-mist)]">
      <Container>
        <div className="flex min-h-[320px] items-center justify-center py-16">
          <LoadingState message={message} />
        </div>
      </Container>
    </div>
  );
}
