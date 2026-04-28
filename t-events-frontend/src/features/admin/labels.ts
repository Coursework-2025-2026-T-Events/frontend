import type { Difficulty, GameEngine } from "@/lib/api/types";

export const difficulties: Difficulty[] = ["easy", "medium", "hard"];

export const difficultyLabels: Record<Difficulty, string> = {
  easy: "легкий",
  medium: "средний",
  hard: "сложный",
};

export const engineLabels: Record<GameEngine | "all", string> = {
  all: "Все",
  quiz: "Викторина",
  question_answer: "Вопрос-ответ",
};

export const statusLabels: Record<string, string> = {
  draft: "черновик",
  published: "опубликовано",
  active: "активно",
  finished: "завершено",
  archived: "архив",
};

export const publishFieldLabels: Record<string, string> = {
  event: "мероприятие",
  title: "название",
  description: "описание",
  start_time: "время начала",
  end_time: "время окончания",
  timezone: "часовой пояс",
  directions: "направления",
  games: "игры",
  questions: "вопросы",
  small_reward_percent: "процент малого приза",
  big_reward_percent: "процент большого приза",
};
