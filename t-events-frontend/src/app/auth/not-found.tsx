import SegmentNotFound from "@/components/route/SegmentNotFound";

export default function AuthNotFound() {
  return (
    <SegmentNotFound
      homeHref="/auth/login"
      homeLabel="К входу"
      message="Страница авторизации не найдена или больше не используется."
      title="Страница авторизации не найдена"
    />
  );
}
