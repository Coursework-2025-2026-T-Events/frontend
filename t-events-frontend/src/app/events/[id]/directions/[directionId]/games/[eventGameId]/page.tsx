"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { ArrowLeft, Check, Loader2, X } from "lucide-react";
import { useParams } from "next/navigation";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import Input from "@/components/ui/Input";
import RequireAuth from "@/features/auth/RequireAuth";
import { eventsApi, type SubmitAnswerPayload } from "@/features/events/api";
import { getQuizKeyboardAction } from "@/features/events/quizKeyboard";
import { getErrorMessage } from "@/lib/getErrorMessage";
import type {
  CurrentQuestionDTO,
  NavigationItemDTO,
  QuizQuestionOptionDTO,
  SessionStateDTO,
  StartOrResumeSessionDTO,
} from "@/lib/api/types";
import { useIsAuthorized } from "@/features/auth/useIsAuthorized";
import { routes } from "@/lib/routes";

type RuntimeState = {
  session_id: number;
  status: SessionStateDTO["status"];
  progress: SessionStateDTO["progress"];
  navigation: NavigationItemDTO[];
  questions: CurrentQuestionDTO[];
  current_question: CurrentQuestionDTO | null;
};

function isFinishedSession(status: SessionStateDTO["status"]): boolean {
  return status === "finished";
}

function canViewSession(status: SessionStateDTO["status"]): boolean {
  return status === "active" || status === "finished";
}

function difficultyLabel(difficulty: CurrentQuestionDTO["difficulty"]): string {
  if (difficulty === "easy") return "Лёгкая";
  if (difficulty === "medium") return "Средняя";
  return "Сложная";
}

function formatPointsLabel(points: number) {
  const absPoints = Math.abs(points);
  const lastTwoDigits = absPoints % 100;
  const lastDigit = absPoints % 10;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return `${points} баллов`;
  if (lastDigit === 1) return `${points} балл`;
  if (lastDigit >= 2 && lastDigit <= 4) return `${points} балла`;
  return `${points} баллов`;
}

function getNavigationItemState(item: NavigationItemDTO) {
  if (item.is_current) return "current";
  if (!item.answered) return "skipped";
  return "answered";
}

function markCurrentNavigationItem(navigation: NavigationItemDTO[], currentQuestionIndex: number | null) {
  if (currentQuestionIndex === null) return navigation;

  return navigation.map((item) => ({
    ...item,
    is_current: item.question_index === currentQuestionIndex,
  }));
}

function getCurrentQuestionNumber(state: RuntimeState) {
  return state.navigation.find((item) => item.is_current)?.question_index ?? state.progress.current_question_index;
}

function getQuestionByIndex(questions: CurrentQuestionDTO[], navigation: NavigationItemDTO[], questionIndex: number | null) {
  if (questionIndex === null) return null;

  const navigationItem = navigation.find((item) => item.question_index === questionIndex);
  if (navigationItem) {
    return questions.find((question) => question.question_id === navigationItem.question_id) ?? null;
  }

  return questions[questionIndex - 1] ?? null;
}

function getCurrentQuestionFromSnapshot(questions: CurrentQuestionDTO[], navigation: NavigationItemDTO[]) {
  const currentItem = navigation.find((item) => item.is_current);
  if (!currentItem) return null;
  return questions.find((question) => question.question_id === currentItem.question_id) ?? null;
}

function toRuntimeState(source: StartOrResumeSessionDTO | SessionStateDTO): RuntimeState {
  return {
    session_id: source.session_id,
    status: source.status,
    progress: source.progress,
    navigation: source.navigation ?? [],
    questions: source.questions ?? [],
    current_question: source.current_question,
  };
}

type QuestionNavigationProps = {
  items: NavigationItemDTO[];
  disabled: boolean;
  onSelect: (item: NavigationItemDTO) => void;
  variant?: "grid" | "scroll";
};

function QuestionNavigation({ disabled, items, onSelect, variant = "grid" }: QuestionNavigationProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Навигация по заданиям">
      <div
        className={clsx(
          variant === "grid" && "grid grid-cols-5 gap-2 sm:grid-cols-6 lg:grid-cols-5",
          variant === "scroll" && "flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        )}
      >
        {items.map((item) => {
          const itemState = getNavigationItemState(item);

          return (
            <button
              key={item.question_id}
              type="button"
              disabled={disabled}
              aria-current={item.is_current ? "step" : undefined}
              aria-label={`Задание ${item.question_index}${item.answered ? ", отвечено" : ""}`}
              className={clsx(
                "flex h-10 min-w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-[15px] font-normal outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--color-brand-black)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70",
                itemState === "current" && "bg-[var(--color-brand-yellow)] text-[var(--color-brand-ink)] shadow-[0_2px_0_rgba(16,17,20,0.08)]",
                itemState === "skipped" && "bg-[#e7e9ee] text-[var(--color-brand-muted)] hover:bg-[#dde0e6]",
                itemState === "answered" && "bg-[#dff4e8] text-[#159947] hover:bg-[#d3eedf]"
              )}
              onClick={() => onSelect(item)}
            >
              {item.question_index}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default function GameSessionPage() {
  const params = useParams();
  const queryClient = useQueryClient();

  const eventId = Number(params.id);
  const directionId = Number(params.directionId);
  const eventGameId = Number(params.eventGameId);
  const isAuthorized = useIsAuthorized();

  const [answerText, setAnswerText] = useState("");
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [navigationError, setNavigationError] = useState<string | null>(null);
  const [optimisticQuestionIndex, setOptimisticQuestionIndex] = useState<number | null>(null);
  const quizOptionRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const hasStartedRef = useRef(false);
  const latestQuestionRequestRef = useRef<number | null>(null);

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

  const sessionStateQueryKey = ["game-session-state", eventId, directionId, eventGameId, activeSessionId] as const;

  const sessionStateQuery = useQuery({
    queryKey: sessionStateQueryKey,
    queryFn: () => eventsApi.getSessionState(eventId, directionId, eventGameId, activeSessionId as number),
    enabled:
      activeSessionId !== null &&
      Number.isFinite(eventId) &&
      Number.isFinite(directionId) &&
      Number.isFinite(eventGameId) &&
      isAuthorized,
  });

  const submitAnswerMutation = useMutation({
    mutationFn: (submitRequest: {
      sessionId: number;
      payload: SubmitAnswerPayload;
      questionIndex: number;
    }) => {
      return eventsApi.submitAnswer(eventId, directionId, eventGameId, submitRequest.sessionId, submitRequest.payload);
    },
    onSuccess: (response) => {
      setAnswerText("");
      setSelectedOptionId(null);
      setOptimisticQuestionIndex(null);
      const questions = response.data.questions ?? [];
      const currentQuestion = getCurrentQuestionFromSnapshot(questions, response.data.navigation);
      queryClient.setQueryData(sessionStateQueryKey, {
        data: {
          session_id: response.data.session_id,
          status: response.data.status,
          progress: response.data.progress,
          navigation: response.data.navigation,
          questions,
          current_question: currentQuestion,
        },
      });

      queryClient.invalidateQueries({ queryKey: ["direction-games", eventId, directionId] });
    },
  });

  const selectQuestionMutation = useMutation({
    mutationFn: (questionIndex: number) => {
      if (activeSessionId === null) throw new Error("Сессия ещё не открыта.");
      return eventsApi.setCurrentQuestion(eventId, directionId, eventGameId, activeSessionId, questionIndex);
    },
    onMutate: () => {
      setNavigationError(null);
    },
    onSuccess: (response, questionIndex) => {
      if (latestQuestionRequestRef.current !== questionIndex) return;

      queryClient.setQueryData(sessionStateQueryKey, response);
      setAnswerText(response.data.current_question?.engine === "question_answer" ? response.data.current_question.text_answer ?? "" : "");
      setSelectedOptionId(
        response.data.current_question?.engine === "quiz" ? response.data.current_question.selected_option_id ?? null : null
      );
      setOptimisticQuestionIndex(null);
    },
    onError: (error, questionIndex) => {
      if (latestQuestionRequestRef.current !== questionIndex) return;

      setNavigationError(getErrorMessage(error, "Не удалось открыть выбранное задание"));
      setOptimisticQuestionIndex(null);
      queryClient.invalidateQueries({ queryKey: sessionStateQueryKey });
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
        navigation: submitAnswerMutation.data.data.navigation,
        questions: submitAnswerMutation.data.data.questions ?? [],
        current_question: getCurrentQuestionFromSnapshot(
          submitAnswerMutation.data.data.questions ?? [],
          submitAnswerMutation.data.data.navigation
        ),
      },
    });
  }
  const state = stateCandidates.sort((left, right) => right.timestamp - left.timestamp)[0]?.state ?? null;

  const serverCurrentQuestionNumber = state ? getCurrentQuestionNumber(state) : null;
  const serverCurrentQuestion =
    state?.current_question ?? (state ? getQuestionByIndex(state.questions, state.navigation, serverCurrentQuestionNumber) : null);
  const optimisticQuestion =
    state && optimisticQuestionIndex !== null
      ? getQuestionByIndex(state.questions, state.navigation, optimisticQuestionIndex)
      : null;
  const isChangingToUncachedQuestion = optimisticQuestionIndex !== null && !optimisticQuestion;
  const currentQuestion = isChangingToUncachedQuestion ? null : optimisticQuestion ?? serverCurrentQuestion;
  const currentQuestionNumber = optimisticQuestionIndex ?? serverCurrentQuestionNumber;
  const navigationItems = state ? markCurrentNavigationItem(state.navigation, currentQuestionNumber) : [];
  const nextNavigationItem =
    currentQuestionNumber === null
      ? null
      : navigationItems.find((item) => item.question_index > currentQuestionNumber) ?? null;
  const isAnsweredQuestion = currentQuestion?.answered ?? false;
  const isCorrectAnsweredQuestion = isAnsweredQuestion && currentQuestion?.is_correct === true;
  const isWrongAnsweredQuestion = isAnsweredQuestion && currentQuestion?.is_correct === false;
  const answerResultLabel = isCorrectAnsweredQuestion ? "Ответ верный" : isWrongAnsweredQuestion ? "Ответ неверный" : null;
  const displayedAnswerText =
    currentQuestion?.engine === "question_answer" && isAnsweredQuestion ? currentQuestion.text_answer ?? "" : answerText;
  const displayedSelectedOptionId =
    currentQuestion?.engine === "quiz" && isAnsweredQuestion
      ? currentQuestion.selected_option_id ?? null
      : selectedOptionId;

  const canSubmit = !!(
    state &&
    state.status === "active" &&
    currentQuestion &&
    optimisticQuestionIndex === null &&
    !isAnsweredQuestion &&
    ((currentQuestion.engine === "question_answer" && answerText.trim().length > 0) ||
      (currentQuestion.engine === "quiz" && displayedSelectedOptionId !== null))
  );

  const handleSubmit = () => {
    if (!currentQuestion || !state) return;

    if (currentQuestion.engine === "question_answer") {
      if (currentQuestionNumber === null) return;
      submitAnswerMutation.mutate({
        sessionId: state.session_id,
        payload: { answer: { text_answer: answerText.trim() } },
        questionIndex: currentQuestionNumber,
      });
      return;
    }

    if (displayedSelectedOptionId === null || currentQuestionNumber === null) return;
    submitAnswerMutation.mutate({
      sessionId: state.session_id,
      payload: { answer: { option_id: displayedSelectedOptionId } },
      questionIndex: currentQuestionNumber,
    });
  };

  const handleQuestionSelect = (item: NavigationItemDTO) => {
    if (!state || item.question_index === currentQuestionNumber || !canViewSession(state.status)) return;

    const selectedQuestion = getQuestionByIndex(state.questions, state.navigation, item.question_index);
    latestQuestionRequestRef.current = item.question_index;
    setNavigationError(null);
    setOptimisticQuestionIndex(item.question_index);
    setAnswerText(selectedQuestion?.engine === "question_answer" ? selectedQuestion.text_answer ?? "" : "");
    setSelectedOptionId(selectedQuestion?.engine === "quiz" ? selectedQuestion.selected_option_id ?? null : null);
    selectQuestionMutation.mutate(item.question_index);
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
      const option = options[index];
      if (option) setSelectedOptionId(option.option_id);
      return;
    }

    if (action.type === "move") {
      event.preventDefault();
      focusQuizOption(options, action.nextIndex);
    }
  };

  const isLoadingInitialState = (startSessionMutation.isPending || sessionStateQuery.isLoading) && !state;
  const initialError = startSessionMutation.error ?? sessionStateQuery.error;
  const isReviewMode = state ? isFinishedSession(state.status) : false;
  const canNavigateQuestions = state ? canViewSession(state.status) : false;

  return (
    <RequireAuth>
      <div className="min-h-[calc(100vh-4rem)] bg-white pb-[calc(10rem+env(safe-area-inset-bottom))] lg:pb-12">
        <Container>
          <div className="py-4 sm:py-8">
            <Button
              variant="ghost"
              href={routes.eventDirectionGames(eventId, directionId)}
              className="-ml-3 min-h-10 gap-2 px-3 text-[15px] font-normal text-[var(--color-brand-muted)] hover:bg-[var(--color-brand-panel)]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              К играм
            </Button>

            {isLoadingInitialState && (
              <div className="mt-8 flex items-center gap-3 text-[15px] leading-6 text-[var(--color-brand-graphite)]">
                <Loader2 className="h-5 w-5 animate-spin text-[var(--color-brand-ink)]" aria-hidden />
                Загрузка игровой сессии...
              </div>
            )}

            {initialError && (
              <div className="mt-8 rounded-[var(--radius-lg)] bg-red-50 p-5 text-[15px] leading-6 text-red-700">
                {getErrorMessage(initialError, "Не удалось открыть игровую сессию")}
              </div>
            )}

            {state && (
              <div className="mt-7 grid gap-7 sm:mt-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
                <main>
                  {state.status === "active" && !currentQuestion && (
                    <section className="min-h-[260px] animate-pulse rounded-[var(--radius-lg)] bg-[var(--color-brand-panel)] p-5 sm:min-h-[320px] sm:p-6">
                      <div className="h-8 w-44 rounded-full bg-[#e3e6ec]" />
                      <div className="mt-8 h-6 max-w-3xl rounded-full bg-[#e3e6ec]" />
                      <div className="mt-4 h-6 max-w-2xl rounded-full bg-[#e3e6ec]" />
                      <div className="mt-10 h-14 max-w-xl rounded-[var(--radius-md)] bg-[#e3e6ec]" />
                    </section>
                  )}

                  {canViewSession(state.status) && currentQuestion && (
                    <section>
                      {isReviewMode && (
                        <div className="mb-6 rounded-[var(--radius-lg)] bg-[#f1f3f6] px-4 py-3 text-[14px] leading-5 text-[var(--color-brand-graphite)]">
                          Игра завершена. Можно посмотреть ответы и результат, но изменить ответы уже нельзя.
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-[22px] font-bold leading-7 text-[var(--color-brand-ink)] sm:text-[26px] sm:leading-8">
                          {currentQuestionNumber ?? currentQuestion.question_id} задание
                        </h1>
                        <span className="rounded-full bg-[var(--color-brand-panel)] px-3 py-1 text-[13px] font-medium leading-[18px] text-[var(--color-brand-graphite)]">
                          {difficultyLabel(currentQuestion.difficulty)}
                        </span>
                        <span className="rounded-full bg-[#dff4e8] px-3 py-1 text-[15px] leading-5 text-[#237a3b]">
                          {formatPointsLabel(currentQuestion.score)}
                        </span>
                      </div>

                      <div className="mt-6 max-w-3xl sm:mt-7">
                        <p className="text-[18px] leading-7 text-[var(--color-brand-ink)] sm:text-[20px] sm:leading-8">{currentQuestion.prompt}</p>
                      </div>

                      {currentQuestion.engine === "question_answer" && (
                        <div className="mt-7 max-w-2xl sm:mt-8">
                          <div className="relative">
                            <Input
                              value={displayedAnswerText}
                              onChange={(event) => setAnswerText(event.target.value)}
                              placeholder="Введите ответ"
                              readOnly={isAnsweredQuestion}
                              aria-readonly={isAnsweredQuestion}
                              aria-invalid={isWrongAnsweredQuestion || undefined}
                              aria-label={answerResultLabel ? `Ответ: ${answerResultLabel}` : "Ответ"}
                              className={clsx(
                                "h-14 pr-12 text-[16px]",
                                isCorrectAnsweredQuestion && "border-[#47b86a] !bg-[#f2fbf5] text-[#1f6f36] focus:border-[#2f9d50]",
                                isWrongAnsweredQuestion && "border-[#dc6b63] !bg-[#fff5f5] text-[#9f2f2f] focus:border-[#c73a3a]"
                              )}
                            />
                            {isCorrectAnsweredQuestion && (
                              <Check className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#237a3b]" aria-hidden />
                            )}
                            {isWrongAnsweredQuestion && (
                              <X className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#c73a3a]" aria-hidden />
                            )}
                          </div>
                        </div>
                      )}

                      {currentQuestion.engine === "quiz" && (
                        <div className="mt-7 grid max-w-3xl gap-3 sm:mt-8 sm:gap-4" role="radiogroup" aria-label="Варианты ответа">
                          {currentQuestion.options.map((option, index) => {
                            const selected = displayedSelectedOptionId === option.option_id;
                            return (
                              <button
                                key={option.option_id}
                                type="button"
                                role="radio"
                                aria-checked={selected}
                                tabIndex={selected || (displayedSelectedOptionId === null && index === 0) ? 0 : -1}
                                ref={(element) => {
                                  quizOptionRefs.current[option.option_id] = element;
                                }}
                                className={clsx(
                                  "group flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-3 text-left text-[16px] leading-6 outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--color-brand-black)] focus-visible:ring-offset-4 disabled:cursor-default sm:gap-5 sm:py-2 sm:text-[20px] sm:leading-8",
                                  selected && !isAnsweredQuestion && "bg-[#eceff4] text-[var(--color-brand-ink)] ring-1 ring-inset ring-[#cfd5df]",
                                  selected &&
                                    isCorrectAnsweredQuestion &&
                                    "bg-[#f2fbf5] text-[#237a3b]",
                                  selected &&
                                    isWrongAnsweredQuestion &&
                                    "bg-[#fff5f5] text-red-700"
                                )}
                                disabled={isAnsweredQuestion}
                                onClick={() => setSelectedOptionId(option.option_id)}
                                onKeyDown={(event) => handleQuizKeyDown(event, currentQuestion.options, index)}
                              >
                                <span
                                  className={clsx(
                                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-panel)] text-transparent transition sm:h-8 sm:w-8",
                                    selected && !isAnsweredQuestion && "bg-white text-[#8a94a6] ring-1 ring-inset ring-[#c2cad6]",
                                    selected && isCorrectAnsweredQuestion && "bg-[#dff4e8] text-[#4bd36b]",
                                    selected && isWrongAnsweredQuestion && "bg-red-50 text-red-500"
                                  )}
                                  aria-hidden
                                >
                                  <span className="h-3 w-3 rounded-full bg-current sm:h-3.5 sm:w-3.5" />
                                </span>
                                <span>{option.text}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      <div className="mt-8 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:items-center">
                        <Button
                          className="min-h-14 w-full px-7 text-[16px] sm:w-auto"
                          disabled={isAnsweredQuestion || !canSubmit || submitAnswerMutation.isPending}
                          onClick={handleSubmit}
                        >
                          {isAnsweredQuestion ? (
                            "Ответ принят"
                          ) : isReviewMode ? (
                            "Игра завершена"
                          ) : submitAnswerMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                              Отправляем...
                            </>
                          ) : (
                            "Отправить ответ"
                          )}
                        </Button>

                        {nextNavigationItem && (
                          <Button
                            variant="secondary"
                            className="min-h-14 w-full px-7 text-[16px] sm:w-auto"
                            disabled={!canNavigateQuestions || selectQuestionMutation.isPending}
                            onClick={() => handleQuestionSelect(nextNavigationItem)}
                          >
                            Следующий вопрос
                          </Button>
                        )}

                        {submitAnswerMutation.error && (
                          <p className="text-[14px] leading-5 text-red-600">
                            {getErrorMessage(submitAnswerMutation.error, "Не удалось отправить ответ")}
                          </p>
                        )}
                      </div>
                    </section>
                  )}

                  {isFinishedSession(state.status) && !currentQuestion && (
                    <section>
                      <h1 className="text-[30px] font-bold leading-9 text-[var(--color-brand-ink)]">Игра завершена</h1>
                      <p className="mt-4 text-[18px] leading-7 text-[var(--color-brand-graphite)]">
                        Ответы сохранены. Если сервер вернёт список заданий для просмотра, они появятся на этой странице.
                      </p>
                    </section>
                  )}

                </main>

                <aside className="hidden space-y-5 lg:block">
                  <section className="rounded-[24px] bg-[#f1f3f6] p-6">
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <h2 className="text-[18px] font-medium leading-6 text-[var(--color-brand-ink)]">Задания</h2>
                      {selectQuestionMutation.isPending && (
                        <Loader2 className="h-4 w-4 animate-spin text-[var(--color-brand-muted)]" aria-hidden />
                      )}
                    </div>
                    <QuestionNavigation
                      disabled={!canNavigateQuestions}
                      items={navigationItems}
                      onSelect={handleQuestionSelect}
                    />
                    {navigationError && (
                      <p className="mt-3 text-[14px] leading-5 text-red-600">{navigationError}</p>
                    )}
                  </section>

                  <section className="rounded-[20px] bg-[#f1f3f6] p-5">
                    <div>
                      <p className="text-[14px] leading-5 text-[var(--color-brand-muted)]">Баллы за игру</p>
                      <p className="mt-1.5 text-[20px] font-medium leading-7 text-[var(--color-brand-ink)]">
                        {state.progress.current_score} из {state.progress.max_score}
                      </p>
                    </div>
                    <div className="mt-5">
                      <p className="text-[14px] leading-5 text-[var(--color-brand-muted)]">Отвечено</p>
                      <p className="mt-1.5 text-[20px] font-medium leading-7 text-[var(--color-brand-ink)]">
                        {state.progress.answered_questions} из {state.progress.total_questions}
                      </p>
                    </div>
                  </section>
                </aside>
              </div>
            )}
          </div>
        </Container>

        {state && (
          <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--color-brand-line)] bg-white/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-10px_30px_rgba(16,17,20,0.08)] backdrop-blur lg:hidden">
            <div className="mx-auto max-w-[720px]">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[12px] leading-4 text-[var(--color-brand-muted)]">Баллы</p>
                  <p className="text-[16px] font-medium leading-5 text-[var(--color-brand-ink)]">
                    {state.progress.current_score} из {state.progress.max_score}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[12px] leading-4 text-[var(--color-brand-muted)]">Отвечено</p>
                  <p className="text-[16px] font-medium leading-5 text-[var(--color-brand-ink)]">
                    {state.progress.answered_questions} из {state.progress.total_questions}
                  </p>
                </div>
              </div>

              <QuestionNavigation
                disabled={!canNavigateQuestions}
                items={navigationItems}
                onSelect={handleQuestionSelect}
                variant="scroll"
              />
              {navigationError && (
                <p className="mt-2 text-[13px] leading-5 text-red-600">{navigationError}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </RequireAuth>
  );
}
