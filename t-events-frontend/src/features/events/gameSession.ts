import type {
  CurrentQuestionDTO,
  NavigationItemDTO,
  SessionStateDTO,
  StartOrResumeSessionDTO,
  SubmitAnswerDTO,
} from "@/lib/api/types";

export type GameSessionRuntimeState = {
  session_id: number;
  status: SessionStateDTO["status"];
  progress: SessionStateDTO["progress"];
  navigation: NavigationItemDTO[];
  questions: CurrentQuestionDTO[];
  current_question: CurrentQuestionDTO | null;
};

export type GameSessionStateCandidate = {
  timestamp: number;
  state: GameSessionRuntimeState;
};

export function isFinishedSession(status: SessionStateDTO["status"]): boolean {
  return status === "finished";
}

export function canViewSession(status: SessionStateDTO["status"]): boolean {
  return status === "active" || status === "finished";
}

export function getDifficultyLabel(difficulty: CurrentQuestionDTO["difficulty"]): string {
  if (difficulty === "easy") return "Лёгкая";
  if (difficulty === "medium") return "Средняя";
  return "Сложная";
}

export function formatGamePoints(points: number): string {
  const absPoints = Math.abs(points);
  const lastTwoDigits = absPoints % 100;
  const lastDigit = absPoints % 10;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return `${points} баллов`;
  if (lastDigit === 1) return `${points} балл`;
  if (lastDigit >= 2 && lastDigit <= 4) return `${points} балла`;
  return `${points} баллов`;
}

export function getNavigationItemState(item: NavigationItemDTO) {
  if (item.is_current) return "current";
  if (!item.answered) return "skipped";
  return "answered";
}

export function markCurrentNavigationItem(navigation: NavigationItemDTO[], currentQuestionIndex: number | null) {
  if (currentQuestionIndex === null) return navigation;

  return navigation.map((item) => ({
    ...item,
    is_current: item.question_index === currentQuestionIndex,
  }));
}

export function getCurrentQuestionNumber(state: GameSessionRuntimeState) {
  return state.navigation.find((item) => item.is_current)?.question_index ?? state.progress.current_question_index;
}

export function getQuestionByIndex(
  questions: CurrentQuestionDTO[],
  navigation: NavigationItemDTO[],
  questionIndex: number | null,
) {
  if (questionIndex === null) return null;

  const navigationItem = navigation.find((item) => item.question_index === questionIndex);
  if (navigationItem) {
    return questions.find((question) => question.question_id === navigationItem.question_id) ?? null;
  }

  return questions[questionIndex - 1] ?? null;
}

export function getCurrentQuestionFromSnapshot(questions: CurrentQuestionDTO[], navigation: NavigationItemDTO[]) {
  const currentItem = navigation.find((item) => item.is_current);
  if (!currentItem) return null;
  return questions.find((question) => question.question_id === currentItem.question_id) ?? null;
}

export function toGameSessionRuntimeState(source: StartOrResumeSessionDTO | SessionStateDTO): GameSessionRuntimeState {
  return {
    session_id: source.session_id,
    status: source.status,
    progress: source.progress,
    navigation: source.navigation ?? [],
    questions: source.questions ?? [],
    current_question: source.current_question,
  };
}

export function toSubmittedAnswerRuntimeState(source: SubmitAnswerDTO): GameSessionRuntimeState {
  const questions = source.questions ?? [];

  return {
    session_id: source.session_id,
    status: source.status,
    progress: source.progress,
    navigation: source.navigation,
    questions,
    current_question: getCurrentQuestionFromSnapshot(questions, source.navigation),
  };
}

export function getLatestGameSessionRuntimeState(candidates: GameSessionStateCandidate[]): GameSessionRuntimeState | null {
  return candidates.sort((left, right) => right.timestamp - left.timestamp)[0]?.state ?? null;
}
