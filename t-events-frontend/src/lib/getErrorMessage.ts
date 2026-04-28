import { ApiError } from "@/lib/api/client";

export type ErrorPresentation = {
  title: string;
  message: string;
  retryable: boolean;
};

const API_ERROR_PRESENTATIONS: Record<string, ErrorPresentation> = {
  http_error: {
    title: "Ошибка запроса",
    message: "Сервер вернул ошибку. Попробуйте повторить действие.",
    retryable: true,
  },
  invalid_request: {
    title: "Проверьте данные",
    message: "Проверьте заполненные поля.",
    retryable: false,
  },
  unauthorized: {
    title: "Нужен вход",
    message: "Необходимо войти в аккаунт.",
    retryable: false,
  },
  forbidden: {
    title: "Нет доступа",
    message: "У вас нет доступа к этому действию.",
    retryable: false,
  },
  validation_error: {
    title: "Проверьте данные",
    message: "Проверьте заполненные поля.",
    retryable: false,
  },
  bad_request: {
    title: "Некорректный запрос",
    message: "Запрос заполнен некорректно.",
    retryable: false,
  },
  conflict: {
    title: "Не удалось завершить действие",
    message: "Не удалось завершить действие с текущими данными. Проверьте введённые данные или обновите страницу.",
    retryable: false,
  },
  bad_gateway: {
    title: "Внешний сервис недоступен",
    message: "Внешний сервис авторизации временно недоступен. Попробуйте позже.",
    retryable: true,
  },
  internal_error: {
    title: "Ошибка сервера",
    message: "На сервере произошла ошибка. Попробуйте позже.",
    retryable: true,
  },
  service_unavailable: {
    title: "Сервис недоступен",
    message: "Вход через VK временно не настроен.",
    retryable: true,
  },
  rate_limited: {
    title: "Слишком много попыток",
    message: "Слишком много попыток, попробуйте позже",
    retryable: true,
  },

  // Sprint 2
  not_found: { title: "Не найдено", message: "Запрошенный ресурс не найден.", retryable: false },
  event_inactive: { title: "Мероприятие недоступно", message: "Мероприятие неактивно.", retryable: false },
  direction_not_belongs_to_event: {
    title: "Направление недоступно",
    message: "Направление не относится к выбранному мероприятию.",
    retryable: false,
  },
  game_not_in_direction: {
    title: "Игра недоступна",
    message: "Игра не относится к выбранному направлению.",
    retryable: false,
  },
  game_already_completed: { title: "Игра завершена", message: "Игра уже завершена.", retryable: false },
  session_does_not_belong_to_user: {
    title: "Сессия недоступна",
    message: "Эта игровая сессия недоступна для текущего пользователя.",
    retryable: false,
  },
  session_not_active: { title: "Сессия неактивна", message: "Сессия неактивна.", retryable: false },
  invalid_answer_payload: {
    title: "Ответ не отправлен",
    message: "Ответ отправлен в неверном формате.",
    retryable: false,
  },
  question_already_answered: {
    title: "Ответ уже принят",
    message: "На этот вопрос уже был дан ответ.",
    retryable: false,
  },
  question_index_out_of_range: {
    title: "Некорректный номер вопроса",
    message: "Некорректный номер вопроса.",
    retryable: false,
  },
  invalid_config: { title: "Проверьте конфигурацию", message: "Некорректная конфигурация игры.", retryable: false },
  event_not_editable: {
    title: "Редактирование недоступно",
    message: "Редактировать можно только черновики мероприятий.",
    retryable: false,
  },
  event_not_schedulable: {
    title: "Расписание не обновлено",
    message: "Расписание мероприятия нельзя изменить в текущем статусе.",
    retryable: false,
  },
  event_archived: { title: "Мероприятие в архиве", message: "Мероприятие находится в архиве.", retryable: false },
  already_published: { title: "Уже опубликовано", message: "Это мероприятие уже опубликовано.", retryable: false },
  already_archived: { title: "Уже в архиве", message: "Это мероприятие уже находится в архиве.", retryable: false },
  publish_validation_failed: {
    title: "Публикация недоступна",
    message: "Мероприятие нельзя опубликовать, пока все направления и игры не настроены.",
    retryable: false,
  },
  direction_has_games: {
    title: "Направление не удалено",
    message: "Направление нельзя удалить, потому что в нем уже есть игры.",
    retryable: false,
  },

  // Sprint 3
  reward_locked: {
    title: "Приз пока недоступен",
    message: "Приз ещё недоступен — продолжайте набирать баллы.",
    retryable: false,
  },
  already_redeemed: {
    title: "Приз уже получен",
    message: "Приз на этом мероприятии уже был получен.",
    retryable: false,
  },
  qr_not_found: { title: "QR-код не найден", message: "QR-код не найден.", retryable: false },
  invalid_qr_signature: { title: "QR-код недействителен", message: "QR-код недействителен.", retryable: false },
  qr_expired: {
    title: "QR-код истёк",
    message: "Срок действия QR-кода истёк. Сгенерируйте новый.",
    retryable: false,
  },
};

const MESSAGE_TRANSLATIONS: Record<string, string> = {
  "Unknown API Error": "Сервер вернул ошибку без описания.",
  "Failed to fetch": "Не удалось подключиться к серверу. Проверьте соединение.",
  "Load failed": "Не удалось загрузить данные.",
  "NetworkError when attempting to fetch resource.": "Не удалось подключиться к серверу. Проверьте соединение.",
  "Network request failed": "Не удалось выполнить сетевой запрос.",
  "Unauthorized": "Необходимо войти в аккаунт.",
  "Forbidden": "У вас нет доступа к этому действию.",
  "Not Found": "Запрошенный ресурс не найден.",
  "Internal Server Error": "На сервере произошла ошибка. Попробуйте позже.",
  "Bad Request": "Запрос заполнен некорректно.",
  "Validation error": "Проверьте заполненные поля.",
  "Invalid credentials": "Неверная электронная почта или пароль.",
  "User already exists": "Пользователь с такими данными уже существует.",
  "Email already registered": "Эта электронная почта уже зарегистрирована.",
};

const ENGLISH_LETTER_PATTERN = /[A-Za-z]/;
const CYRILLIC_LETTER_PATTERN = /[А-Яа-яЁё]/;

export function localizeErrorText(message: string, fallback: string): string {
  const trimmed = message.trim();
  if (!trimmed) return fallback;
  if (MESSAGE_TRANSLATIONS[trimmed]) return MESSAGE_TRANSLATIONS[trimmed];
  if (CYRILLIC_LETTER_PATTERN.test(trimmed)) return trimmed;
  return ENGLISH_LETTER_PATTERN.test(trimmed) ? fallback : trimmed;
}

function getStatusPresentation(error: ApiError, fallback: string): ErrorPresentation {
  if (error.status === 401) return API_ERROR_PRESENTATIONS.unauthorized;
  if (error.status === 403) return API_ERROR_PRESENTATIONS.forbidden;
  if (error.status === 404) return API_ERROR_PRESENTATIONS.not_found;
  if (error.status === 409) return API_ERROR_PRESENTATIONS.conflict;
  if (error.status === 400 || error.status === 422) return API_ERROR_PRESENTATIONS.validation_error;
  if (error.status >= 500) return API_ERROR_PRESENTATIONS.internal_error;
  return { title: "Ошибка", message: localizeErrorText(error.message, fallback), retryable: false };
}

export function getErrorPresentation(error: unknown, fallback: string): ErrorPresentation {
  if (error instanceof ApiError) {
    return API_ERROR_PRESENTATIONS[error.code] ?? getStatusPresentation(error, fallback);
  }
  if (error instanceof Error) {
    const message = localizeErrorText(error.message, fallback);
    const retryable = message.includes("подключиться") || message.includes("сетевой");
    return { title: retryable ? "Проблема с подключением" : "Ошибка", message, retryable };
  }
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message: unknown }).message;
    if (typeof message === "string") {
      return { title: "Ошибка", message: localizeErrorText(message, fallback), retryable: false };
    }
  }
  return { title: "Ошибка", message: fallback, retryable: false };
}

export function getErrorMessage(error: unknown, fallback: string): string {
  return getErrorPresentation(error, fallback).message;
}
