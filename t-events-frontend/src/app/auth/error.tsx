"use client";

import SegmentError from "@/components/route/SegmentError";

export default function AuthError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <SegmentError
      homeHref="/auth/login"
      homeLabel="К входу"
      message="Не удалось открыть страницу авторизации. Попробуйте повторить действие."
      reset={reset}
      title="Авторизация временно недоступна"
    />
  );
}
