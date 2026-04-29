import SegmentNotFound from "@/components/route/SegmentNotFound";

export default function StanderNotFound() {
  return (
    <SegmentNotFound
      homeHref="/stander/scan"
      homeLabel="К сканированию"
      message="Страница стендера не найдена или была перемещена."
      title="Страница стендера не найдена"
    />
  );
}
