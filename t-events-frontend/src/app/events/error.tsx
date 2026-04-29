"use client";

import SegmentError from "@/components/route/SegmentError";

export default function EventsError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <SegmentError
      message="Не удалось отобразить мероприятия. Попробуйте обновить раздел."
      reset={reset}
      title="Мероприятия временно недоступны"
    />
  );
}
