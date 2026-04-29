import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useIsAuthorized } from "@/features/auth/useIsAuthorized";
import type { NavigationItemDTO } from "@/lib/api/types";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { queryKeys } from "@/lib/queryKeys";
import { eventsApi, type SubmitAnswerPayload } from "./api";
import {
  canViewSession,
  getCurrentQuestionFromSnapshot,
  getCurrentQuestionNumber,
  getLatestGameSessionRuntimeState,
  getQuestionByIndex,
  isFinishedSession,
  markCurrentNavigationItem,
  toGameSessionRuntimeState,
  toSubmittedAnswerRuntimeState,
  type GameSessionStateCandidate,
} from "./gameSession";

type SubmitAnswerRequest = {
  sessionId: number;
  payload: SubmitAnswerPayload;
  questionIndex: number;
};

export function useGameSessionPage() {
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
  const sessionStateQueryKey = queryKeys.events.gameSessionState(eventId, directionId, eventGameId, activeSessionId);

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
    mutationFn: (submitRequest: SubmitAnswerRequest) => {
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

      queryClient.invalidateQueries({ queryKey: queryKeys.events.directionGames(eventId, directionId) });
    },
  });

  const selectQuestionMutation = useMutation({
    mutationFn: (questionIndex: number) => {
      if (activeSessionId === null) throw new Error("Сессия еще не открыта.");
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
        response.data.current_question?.engine === "quiz" ? response.data.current_question.selected_option_id ?? null : null,
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

  const stateCandidates: GameSessionStateCandidate[] = [];
  if (startSessionMutation.data?.data) {
    stateCandidates.push({
      timestamp: startSessionMutation.submittedAt,
      state: toGameSessionRuntimeState(startSessionMutation.data.data),
    });
  }
  if (sessionStateQuery.data?.data) {
    stateCandidates.push({
      timestamp: sessionStateQuery.dataUpdatedAt,
      state: toGameSessionRuntimeState(sessionStateQuery.data.data),
    });
  }
  if (submitAnswerMutation.data?.data) {
    stateCandidates.push({
      timestamp: submitAnswerMutation.submittedAt,
      state: toSubmittedAnswerRuntimeState(submitAnswerMutation.data.data),
    });
  }

  const state = getLatestGameSessionRuntimeState(stateCandidates);
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

  return {
    answerResultLabel,
    answerText,
    canNavigateQuestions: state ? canViewSession(state.status) : false,
    canSubmit,
    currentQuestion,
    currentQuestionNumber,
    directionId,
    displayedAnswerText,
    displayedSelectedOptionId,
    eventGameId,
    eventId,
    handleQuestionSelect,
    handleSubmit,
    initialError: startSessionMutation.error ?? sessionStateQuery.error,
    isAnsweredQuestion,
    isCorrectAnsweredQuestion,
    isLoadingInitialState: (startSessionMutation.isPending || sessionStateQuery.isLoading) && !state,
    isReviewMode: state ? isFinishedSession(state.status) : false,
    isWrongAnsweredQuestion,
    navigationError,
    navigationItems,
    nextNavigationItem,
    selectQuestionMutation,
    selectedOptionId,
    setAnswerText,
    setSelectedOptionId,
    startSessionMutation,
    state,
    submitAnswerMutation,
  };
}
