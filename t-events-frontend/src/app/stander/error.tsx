"use client";

import SegmentError from "@/components/route/SegmentError";

export default function StanderError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <SegmentError
      homeHref="/stander/scan"
      homeLabel="К сканированию"
      message="Не удалось отобразить раздел стендера. Попробуйте обновить страницу."
      reset={reset}
      title="Раздел стендера временно недоступен"
    />
  );
}
