"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import Typography from "@/components/ui/Typography";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import RequireAuth from "@/features/auth/RequireAuth";
import { eventsApi, type SubmitAnswerPayload } from "@/features/events/api";
import { getQuizKeyboardAction } from "@/features/events/quizKeyboard";
import { getErrorMessage } from "@/lib/getErrorMessage";
import type { CurrentQuestionDTO, QuizQuestionOptionDTO, SessionStateDTO, StartOrResumeSessionDTO } from "@/lib/api/types";
import { useIsAuthorized } from "@/features/auth/useIsAuthorized";
import { routes } from "@/lib/routes";

type RuntimeState = {
  session_id: number;
  status: SessionStateDTO["status"];
  progress: SessionStateDTO["progress"];
  current_question: CurrentQuestionDTO | null;
};

function isFinishedSession(status: SessionStateDTO["status"]): boolean {
  return status === "finished";
}

function difficultyLabel(difficulty: CurrentQuestionDTO["difficulty"]): string {
  if (difficulty === "easy") return "легкая";
  if (difficulty === "medium") return "средняя";
  return "сложная";
}

function toRuntimeState(source: StartOrResumeSessionDTO | SessionStateDTO): RuntimeState {
  return {
    session_id: source.session_id,
    status: source.status,
    progress: source.progress,
    current_question: source.current_question,
  };
}

export default function GameSessionPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const eventId = Number(params.id);
  const directionId = Number(params.directionId);
  const eventGameId = Number(params.eventGameId);
  const isAuthorized = useIsAuthorized();

  const [answerText, setAnswerText] = useState("");
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const quizOptionRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const hasStartedRef = useRef(false);

  const startSessionMutation = useMutation({
    mutationFn: () => eventsApi.startOrResumeSession(eventId, directionId, eventGameId),
  });

  useEffect(() => {
    hasStartedRef.current = false;
  }, [eventId, directionId, eventGameId]);

  useEffect(() => {
    if (!isAuthorized) return;
    if (!Number.isFinite(eventId) || !Number.isFinite(directionId) || !Number.isFinite(eventGameId)) return;
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    startSessionMutation.mutate();
  }, [directionId, eventGameId, eventId, isAuthorized, startSessionMutation]);

  const activeSessionId = startSessionMutation.data?.data.session_id ?? null;

  const sessionStateQuery = useQuery({
    queryKey: ["game-session-state", eventId, directionId, eventGameId, activeSessionId],
    queryFn: () => eventsApi.getSessionState(eventId, directionId, eventGameId, activeSessionId as number),
    enabled:
      activeSessionId !== null &&
      Number.isFinite(eventId) &&
      Number.isFinite(directionId) &&
      Number.isFinite(eventGameId) &&
      isAuthorized,
  });

  const submitAnswerMutation = useMutation({
    mutationFn: (submitRequest: { sessionId: number; payload: SubmitAnswerPayload }) => {
      return eventsApi.submitAnswer(eventId, directionId, eventGameId, submitRequest.sessionId, submitRequest.payload);
    },
    onSuccess: () => {
      setAnswerText("");
      setSelectedOptionId(null);
      queryClient.invalidateQueries({ queryKey: ["direction-games", eventId, directionId] });
    },
  });

  const stateCandidates: Array<{ timestamp: number; state: RuntimeState }> = [];
  if (startSessionMutation.data?.data) {
    stateCandidates.push({
      timestamp: startSessionMutation.submittedAt,
      state: toRuntimeState(startSessionMutation.data.data),
    });
  }
  if (sessionStateQuery.data?.data) {
    stateCandidates.push({
      timestamp: sessionStateQuery.dataUpdatedAt,
      state: toRuntimeState(sessionStateQuery.data.data),
    });
  }
  if (submitAnswerMutation.data?.data) {
    stateCandidates.push({
      timestamp: submitAnswerMutation.submittedAt,
      state: {
        session_id: submitAnswerMutation.data.data.session_id,
        status: submitAnswerMutation.data.data.status,
        progress: submitAnswerMutation.data.data.progress,
        current_question: submitAnswerMutation.data.data.next_question,
      },
    });
  }
  const state = stateCandidates.sort((left, right) => right.timestamp - left.timestamp)[0]?.state ?? null;

  const gameTitle = startSessionMutation.data?.data?.game.title ?? "Игра";
  const lastResult = submitAnswerMutation.data?.data?.answer_result ?? null;
  const directionSummary = submitAnswerMutation.data?.data?.direction_summary ?? null;
  const currentQuestion = state?.current_question;

  const canSubmit = !!(
    state &&
    state.status === "active" &&
    currentQuestion &&
    ((currentQuestion.engine === "question_answer" && answerText.trim().length > 0) ||
      (currentQuestion.engine === "quiz" && selectedOptionId !== null))
  );

  const handleSubmit = () => {
    if (!currentQuestion || !state) return;

    if (currentQuestion.engine === "question_answer") {
      submitAnswerMutation.mutate({
        sessionId: state.session_id,
        payload: { answer: { text_answer: answerText.trim() } },
      });
      return;
    }

    if (selectedOptionId === null) return;
    submitAnswerMutation.mutate({
      sessionId: state.session_id,
      payload: { answer: { option_id: selectedOptionId } },
    });
  };

  const focusQuizOption = (options: QuizQuestionOptionDTO[], index: number) => {
    const option = options[index];
    if (!option) return;
    setSelectedOptionId(option.option_id);
    quizOptionRefs.current[option.option_id]?.focus();
  };

  const handleQuizKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    options: QuizQuestionOptionDTO[],
    index: number
  ) => {
    const action = getQuizKeyboardAction(event.key, index, options.length);

    if (action.type === "select") {
      event.preventDefault();
      setSelectedOptionId(options[index].option_id);
      return;
    }

    if (action.type === "move") {
      event.preventDefault();
      focusQuizOption(options, action.nextIndex);
    }
  };

  const isLoadingInitialState = (startSessionMutation.isPending || sessionStateQuery.isLoading) && !state;
  const initialError = startSessionMutation.error ?? sessionStateQuery.error;

  return (
    <RequireAuth>
      <Container>
        <div className="mt-8 space-y-4">
          <Typography as="h1" size="xl" weight="bold">
            {gameTitle}
          </Typography>
          <Breadcrumbs
            items={[
              { label: "Мероприятия", href: routes.events },
              { label: "Игры", href: routes.eventDirectionGames(eventId, directionId) },
              { label: gameTitle },
            ]}
          />

          {isLoadingInitialState && <Typography>Загрузка сессии...</Typography>}

          {initialError && (
            <Typography className="text-red-600" size="sm">
              {getErrorMessage(initialError, "Не удалось открыть игровую сессию")}
            </Typography>
          )}

          {state && (
            <div className="rounded-[var(--radius-md)] border border-neutral-200 bg-white p-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-neutral-700">
                <span className="font-medium">Баллы: {state.progress.current_score} / {state.progress.max_score}</span>
                <span>Вопросы: {state.progress.answered_questions} / {state.progress.total_questions}</span>
                <span>{isFinishedSession(state.status) ? "Завершена" : state.status === "expired" ? "Истекла" : "Активна"}</span>
              </div>
            </div>
          )}

          {(lastResult || directionSummary) && (
            <div className="rounded-[var(--radius-md)] border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-700">
              {lastResult && (
                <span className="font-medium">
                  {lastResult.is_correct ? "Верно" : "Неверно"}, +{lastResult.earned_score} баллов.
                </span>
              )}
              {directionSummary && (
                <span className="ml-2">
                  Направление: {directionSummary.current_direction_score} / {directionSummary.direction_max_score}.
                </span>
              )}
            </div>
          )}

          {state && isFinishedSession(state.status) && (
            <Card>
              <Typography as="h2" size="lg" weight="bold">
                Игра завершена
              </Typography>
              <Typography className="mt-2 text-neutral-700" size="sm">
                Повторное прохождение завершенной игры недоступно.
              </Typography>
            </Card>
          )}

          {state?.status === "active" && currentQuestion && (
            <Card>
              <Typography as="h2" size="lg" weight="bold">
                Вопрос
              </Typography>
              <Typography className="mt-2 text-neutral-800" size="md">
                {currentQuestion.prompt}
              </Typography>
              <Typography className="mt-2 text-neutral-600" size="sm">
                Сложность: {difficultyLabel(currentQuestion.difficulty)}, баллы: {currentQuestion.score}
              </Typography>

              {currentQuestion.engine === "question_answer" && (
                <div className="mt-4">
                  <Input
                    label="Ваш ответ"
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    placeholder="Введите текстовый ответ"
                  />
                </div>
              )}

              {currentQuestion.engine === "quiz" && (
                <div className="mt-4 space-y-2" role="radiogroup" aria-label="Варианты ответа">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={option.option_id}
                      type="button"
                      role="radio"
                      aria-checked={selectedOptionId === option.option_id}
                      tabIndex={selectedOptionId === option.option_id || (selectedOptionId === null && index === 0) ? 0 : -1}
                      ref={(element) => {
                        quizOptionRefs.current[option.option_id] = element;
                      }}
                      className={`flex w-full items-center justify-between gap-3 rounded border px-3 py-2 text-left text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[var(--color-brand-black)] focus-visible:ring-offset-2 ${
                        selectedOptionId === option.option_id
                          ? "border-[var(--color-brand-black)] bg-[var(--color-brand-yellow)]"
                          : "border-neutral-200 bg-white hover:bg-neutral-50"
                      }`}
                      onClick={() => setSelectedOptionId(option.option_id)}
                      onKeyDown={(event) => handleQuizKeyDown(event, currentQuestion.options, index)}
                    >
                      <span>{option.text}</span>
                      {selectedOptionId === option.option_id && (
                        <span className="shrink-0 text-xs font-bold uppercase text-[var(--color-brand-black)]">
                          Выбрано
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              <Button className="mt-4" disabled={!canSubmit || submitAnswerMutation.isPending} onClick={handleSubmit}>
                {submitAnswerMutation.isPending ? "Отправка..." : "Отправить ответ"}
              </Button>

              {submitAnswerMutation.error && (
                <Typography className="mt-3 text-red-600" size="sm">
                  {getErrorMessage(submitAnswerMutation.error, "Не удалось отправить ответ")}
                </Typography>
              )}
            </Card>
          )}

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => router.push(routes.eventDirectionGames(eventId, directionId))}>
              К списку игр
            </Button>
          </div>
        </div>
      </Container>
    </RequireAuth>
  );
}
