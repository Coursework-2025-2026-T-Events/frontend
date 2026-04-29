"use client";

import SegmentError from "@/components/route/SegmentError";

export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <SegmentError
      homeHref="/admin/events"
      homeLabel="К админ-панели"
      message="Не удалось отобразить административный раздел. Попробуйте обновить страницу."
      reset={reset}
      title="Админ-раздел временно недоступен"
    />
  );
}
