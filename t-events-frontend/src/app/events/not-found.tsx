import SegmentNotFound from "@/components/route/SegmentNotFound";

export default function EventsNotFound() {
  return (
    <SegmentNotFound
      message="Мероприятие, направление или игра не найдены. Вернитесь к списку мероприятий и выберите доступный сценарий."
      title="Раздел мероприятий не найден"
    />
  );
}
