import { ApiError } from "@/lib/api/client";

const API_ERROR_MESSAGES: Record<string, string> = {
  not_found: "Запрошенный ресурс не найден.",
  event_inactive: "Мероприятие неактивно.",
  direction_not_belongs_to_event: "Направление не относится к выбранному мероприятию.",
  game_not_in_direction: "Игра не относится к выбранному направлению.",
  game_already_completed: "Игра уже завершена.",
  session_does_not_belong_to_user: "Сессия не принадлежит текущему пользователю.",
  session_not_active: "Сессия неактивна.",
  invalid_answer_payload: "Ответ отправлен в неверном формате.",
  question_already_answered: "На этот вопрос уже был дан ответ.",
};

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    return API_ERROR_MESSAGES[error.code] ?? error.message;
  }
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message: unknown }).message;
    if (typeof message === "string") return message;
  }
  return fallback;
}
