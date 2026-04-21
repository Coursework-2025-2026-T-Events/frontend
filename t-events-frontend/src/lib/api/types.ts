export type UserDTO = {
  user_id: number;
  email: string;
  full_name: string;
  role: UserRole;
};

export type UserRole = "participant" | "stander" | "admin";

export type EventDTO = {
  event_id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
};

export type DirectionDTO = {
  direction_id: number;
  name: string;
  event_id?: number;
};

export type GameStatus = "not_started" | "in_progress" | "completed";
export type SessionStatus = "active" | "completed" | "expired";
export type GameEngine = "question_answer" | "quiz";

export type DirectionProgressSummaryDTO = {
  current_direction_score: number;
  direction_max_score: number;
  current_event_score: number;
  event_max_score: number;
  small_reward_threshold: number;
  big_reward_threshold: number;
  small_reward_unlocked: boolean;
  big_reward_unlocked: boolean;
};

export type StepBasedProgressDTO = {
  current_score: number;
  max_score: number;
  answered_questions: number;
  total_questions: number;
  current_question_index: number;
};

export type DirectionGamesItemDTO = {
  event_game_id: number;
  game_template_id: number;
  title: string;
  description: string;
  engine: GameEngine;
  status: GameStatus;
  max_score: number;
  steps_total: number;
  progress: StepBasedProgressDTO;
};

export type DirectionGamesDTO = {
  direction: {
    direction_id: number;
    name: string;
  };
  summary: DirectionProgressSummaryDTO;
  games: DirectionGamesItemDTO[];
};

export type QuestionAnswerQuestionDTO = {
  question_id: number;
  engine: "question_answer";
  prompt: string;
  difficulty: "easy" | "medium" | "hard";
  score: number;
};

export type QuizQuestionOptionDTO = {
  option_id: number;
  text: string;
};

export type QuizQuestionDTO = {
  question_id: number;
  engine: "quiz";
  prompt: string;
  difficulty: "easy" | "medium" | "hard";
  score: number;
  options: QuizQuestionOptionDTO[];
};

export type CurrentQuestionDTO = QuestionAnswerQuestionDTO | QuizQuestionDTO;

export type StartOrResumeSessionDTO = {
  session_id: number;
  status: SessionStatus;
  game: {
    event_game_id: number;
    game_template_id: number;
    title: string;
    engine: GameEngine;
  };
  progress: StepBasedProgressDTO;
  current_question: CurrentQuestionDTO | null;
};

export type SessionStateDTO = {
  session_id: number;
  status: SessionStatus;
  progress: StepBasedProgressDTO;
  current_question: CurrentQuestionDTO | null;
};

export type SessionAnswerResultDTO = {
  question_id: number;
  is_correct: boolean;
  earned_score: number;
};

export type SubmitAnswerDTO = {
  session_id: number;
  status: SessionStatus;
  answer_result: SessionAnswerResultDTO;
  progress: StepBasedProgressDTO;
  direction_summary: DirectionProgressSummaryDTO;
  next_question: CurrentQuestionDTO | null;
};

export type ApiResponse<T> = { data: T };

export type RegisterResponse = ApiResponse<{ user_id: number; email: string }>;
export type LoginResponse = ApiResponse<{ access_token: string; user: UserDTO }>;
export type UserResponse = ApiResponse<UserDTO>;
export type EventResponse = ApiResponse<EventDTO>;
export type EventsResponse = ApiResponse<EventDTO[]>;
export type DirectionResponse = ApiResponse<DirectionDTO>;
export type DirectionsResponse = ApiResponse<DirectionDTO[]>;
export type DirectionGamesResponse = ApiResponse<DirectionGamesDTO>;
export type StartOrResumeSessionResponse = ApiResponse<StartOrResumeSessionDTO>;
export type SessionStateResponse = ApiResponse<SessionStateDTO>;
export type SubmitAnswerResponse = ApiResponse<SubmitAnswerDTO>;
