import SegmentNotFound from "@/components/route/SegmentNotFound";

export default function AdminNotFound() {
  return (
    <SegmentNotFound
      homeHref="/admin/events"
      homeLabel="К админ-панели"
      message="Административная страница не найдена или была перемещена."
      title="Админ-страница не найдена"
    />
  );
}
