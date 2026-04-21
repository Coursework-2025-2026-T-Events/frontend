"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import Typography from "@/components/ui/Typography";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import RequireAuth from "@/features/auth/RequireAuth";
import { eventsApi, type SubmitAnswerPayload } from "@/features/events/api";
import { getErrorMessage } from "@/lib/getErrorMessage";
import type { CurrentQuestionDTO, SessionStateDTO, StartOrResumeSessionDTO } from "@/lib/api/types";
import { useAuth } from "@/features/auth/AuthProvider";

type RuntimeState = {
  session_id: number;
  status: SessionStateDTO["status"];
  progress: SessionStateDTO["progress"];
  current_question: CurrentQuestionDTO | null;
};

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
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const eventId = Number(params.id);
  const directionId = Number(params.directionId);
  const eventGameId = Number(params.eventGameId);
  const { user, isBootstrapping } = useAuth();
  const isAuthorized = !isBootstrapping && !!user;

  const sessionIdParam = Number(searchParams.get("sessionId"));

  const [answerText, setAnswerText] = useState("");
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);

  const bootstrapQuery = useQuery({
    queryKey: ["game-session-bootstrap", eventId, directionId, eventGameId],
    queryFn: () => eventsApi.startOrResumeSession(eventId, directionId, eventGameId),
    enabled: Number.isFinite(eventId) && Number.isFinite(directionId) && Number.isFinite(eventGameId) && isAuthorized,
  });

  const syncStateQuery = useQuery({
    queryKey: ["game-session-state", eventId, directionId, eventGameId, sessionIdParam],
    queryFn: () => eventsApi.getSessionState(eventId, directionId, eventGameId, sessionIdParam),
    enabled:
      Number.isFinite(sessionIdParam) &&
      sessionIdParam > 0 &&
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

  const state = submitAnswerMutation.data?.data
    ? ({
        session_id: submitAnswerMutation.data.data.session_id,
        status: submitAnswerMutation.data.data.status,
        progress: submitAnswerMutation.data.data.progress,
        current_question: submitAnswerMutation.data.data.next_question,
      } as RuntimeState)
    : syncStateQuery.data?.data
      ? toRuntimeState(syncStateQuery.data.data)
      : bootstrapQuery.data?.data
        ? toRuntimeState(bootstrapQuery.data.data)
        : null;

  const gameTitle = bootstrapQuery.data?.data?.game.title ?? "Игра";
  const lastResult = submitAnswerMutation.data?.data?.answer_result ?? null;

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

  const currentQuestionView = state?.current_question;

  return (
    <RequireAuth>
      <Container>
        <div className="mt-8 space-y-4">
          <Typography as="h1" size="xl" weight="bold">
            {gameTitle}
          </Typography>

          {(bootstrapQuery.isLoading || syncStateQuery.isLoading) && <Typography>Загрузка сессии...</Typography>}

          {(bootstrapQuery.error || syncStateQuery.error) && (
            <Typography className="text-red-600" size="sm">
              {getErrorMessage(bootstrapQuery.error ?? syncStateQuery.error, "Не удалось открыть игровую сессию")}
            </Typography>
          )}

          {state && (
            <Card>
              <Typography as="h2" size="lg" weight="bold">
                Прогресс
              </Typography>
              <Typography className="mt-2 text-neutral-700" size="sm">
                Баллы: {state.progress.current_score} / {state.progress.max_score}
              </Typography>
              <Typography className="mt-1 text-neutral-700" size="sm">
                Вопросы: {state.progress.answered_questions} / {state.progress.total_questions}
              </Typography>
              <Typography className="mt-1 text-neutral-700" size="sm">
                Текущий вопрос: {state.progress.current_question_index}
              </Typography>
              <Typography className="mt-1 text-neutral-700" size="sm">
                Статус: {state.status === "completed" ? "завершена" : state.status === "expired" ? "истекла" : "активна"}
              </Typography>
            </Card>
          )}

          {lastResult && (
            <Card>
              <Typography as="h2" size="lg" weight="bold">
                Последний ответ
              </Typography>
              <Typography className="mt-2 text-neutral-700" size="sm">
                {lastResult.is_correct ? "Верно" : "Неверно"}, начислено баллов: {lastResult.earned_score}
              </Typography>
            </Card>
          )}

          {state?.status === "completed" && (
            <Card>
              <Typography as="h2" size="lg" weight="bold">
                Игра завершена
              </Typography>
              <Typography className="mt-2 text-neutral-700" size="sm">
                Повторное прохождение завершенной игры недоступно.
              </Typography>
            </Card>
          )}

          {state?.status === "active" && currentQuestionView && (
            <Card>
              <Typography as="h2" size="lg" weight="bold">
                Вопрос
              </Typography>
              <Typography className="mt-2 text-neutral-800" size="md">
                {currentQuestionView.prompt}
              </Typography>
              <Typography className="mt-2 text-neutral-600" size="sm">
                Сложность: {currentQuestionView.difficulty}, баллы: {currentQuestionView.score}
              </Typography>

              {currentQuestionView.engine === "question_answer" && (
                <div className="mt-4">
                  <Input
                    label="Ваш ответ"
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    placeholder="Введите текстовый ответ"
                  />
                </div>
              )}

              {currentQuestionView.engine === "quiz" && (
                <div className="mt-4 space-y-2">
                  {currentQuestionView.options.map((option) => (
                    <button
                      key={option.option_id}
                      type="button"
                      className={`w-full rounded border px-3 py-2 text-left text-sm ${
                        selectedOptionId === option.option_id
                          ? "border-[var(--color-brand-black)] bg-[var(--color-brand-yellow)]"
                          : "border-neutral-200"
                      }`}
                      onClick={() => setSelectedOptionId(option.option_id)}
                    >
                      {option.text}
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
            <Button variant="secondary" onClick={() => router.push(`/events/${eventId}/directions/${directionId}/games`)}>
              К списку игр
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                bootstrapQuery.refetch();
                syncStateQuery.refetch();
              }}
            >
              Обновить состояние
            </Button>
          </div>
        </div>
      </Container>
    </RequireAuth>
  );
}
