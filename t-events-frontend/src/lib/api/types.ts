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
  start_time: string | null;
  end_time: string | null;
  status: EventStatus;
};

export type EventStatus = "draft" | "published" | "active" | "finished" | "archived";

export type DirectionDTO = {
  direction_id: number;
  name: string;
  event_id?: number;
};

export type GameStatus = "not_started" | "in_progress" | "completed";
export type SessionStatus = "active" | "paused" | "finished" | "expired";
export type GameEngine = "question_answer" | "quiz";
export type Difficulty = "easy" | "medium" | "hard";

export type DirectionProgressSummaryDTO = {
  current_direction_score: number;
  direction_max_score: number;
  small_reward_threshold: number;
  big_reward_threshold: number;
  small_reward_unlocked: boolean;
  big_reward_unlocked: boolean;
};

export type LeaderboardEntryDTO = {
  rank: number;
  user_id: number;
  full_name: string;
  direction_score: number;
};

export type LeaderboardMeDTO = LeaderboardEntryDTO & {
  in_page: boolean;
};

export type DirectionLeaderboardDTO = {
  event_id: number;
  direction_id: number;
  total_participants: number;
  limit: number;
  offset: number;
  entries: LeaderboardEntryDTO[];
  me: LeaderboardMeDTO | null;
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
  difficulty: Difficulty;
  score: number;
  answered: boolean;
  is_correct?: boolean;
  text_answer?: string;
};

export type QuizQuestionOptionDTO = {
  option_id: number;
  text: string;
};

export type QuizQuestionDTO = {
  question_id: number;
  engine: "quiz";
  prompt: string;
  difficulty: Difficulty;
  score: number;
  options: QuizQuestionOptionDTO[];
  answered: boolean;
  is_correct?: boolean;
  selected_option_id?: number;
};

export type CurrentQuestionDTO = QuestionAnswerQuestionDTO | QuizQuestionDTO;

export type NavigationItemDTO = {
  question_index: number;
  question_id: number;
  answered: boolean;
  is_correct?: boolean;
  is_current: boolean;
};

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
  navigation: NavigationItemDTO[];
  questions: CurrentQuestionDTO[];
  current_question: CurrentQuestionDTO | null;
};

export type SessionStateDTO = {
  session_id: number;
  status: SessionStatus;
  progress: StepBasedProgressDTO;
  navigation: NavigationItemDTO[];
  questions: CurrentQuestionDTO[];
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
  navigation: NavigationItemDTO[];
  questions: CurrentQuestionDTO[];
};

// ─── Sprint 3 ────────────────────────────────────────────────────────────────

export type RewardStatus = "locked" | "small_unlocked" | "big_unlocked" | "redeemed";
export type RewardType = "small" | "big";
export type QrStatus = "active" | "redeemed" | "expired" | "cancelled";

export type EventRedemptionStateDTO = {
  is_redeemed: boolean;
  redeemed_reward_type: RewardType | null;
  redeemed_from_direction_id: number | null;
  redeemed_at: string | null;
};

export type RewardEligibilityDTO = {
  event_id: number;
  direction_id: number;
  current_direction_score: number;
  small_reward_threshold: number;
  big_reward_threshold: number;
  status: RewardStatus;
  max_available_reward_type: RewardType | null;
  is_qr_available: boolean;
  event_redemption: EventRedemptionStateDTO;
};

export type RewardQrDTO = {
  qr_id: string;
  event_id: number;
  direction_id: number;
  reward_type: RewardType;
  status: QrStatus;
  issued_at: string;
  expires_at: string;
  signed_token: string;
};

export type RedemptionPreviewDTO = {
  event_id: number;
  event_title: string;
  user_id: number;
  full_name: string;
  direction_id: number;
  reward_type: RewardType;
  qr_status: QrStatus;
  eligibility_status: RewardStatus;
  already_redeemed: boolean;
};

export type RewardRedemptionDTO = {
  redemption_id: string;
  event_id: number;
  user_id: number;
  full_name: string;
  direction_id: number;
  reward_type: RewardType;
  qr_id: string;
  stander_user_id: number;
  created_at: string;
};

export type EventRedemptionDTO = {
  is_redeemed: boolean;
  reward_type: RewardType | null;
  direction_id: number | null;
  redeemed_at: string | null;
};

export type AdminEventDTO = {
  event_id: number;
  title: string;
  description: string;
  start_time: string | null;
  end_time: string | null;
  timezone: string | null;
  status: EventStatus;
  small_reward_percent: number | null;
  big_reward_percent: number | null;
  direction_count: number;
  game_count: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  archived_at: string | null;
  created_by_user_id: number | null;
  updated_by_user_id: number | null;
};

export type AdminEventCreateRequest = {
  title: string;
};

export type AdminEventPutRequest = {
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  timezone: string;
  small_reward_percent: number;
  big_reward_percent: number;
};

export type AdminEventPatchRequest = Partial<AdminEventPutRequest>;

export type AdminEventSchedulePatchRequest = {
  start_time: string;
  end_time: string;
  timezone: string;
};

export type PublishValidationErrorDTO = {
  code: string;
  field?: string;
  message: string;
};

export type ArchiveEventDTO = {
  event_id: number;
  status: "archived";
  archived_at: string | null;
};

export type EventDirectionLinkDTO = {
  event_id: number;
  direction_id: number;
};

export type TemplateQuestionStatsDTO = Record<Difficulty, number> & {
  total: number;
};

export type GameTemplateDTO = {
  game_template_id: number;
  title: string;
  description: string;
  engine: GameEngine;
  question_stats: TemplateQuestionStatsDTO;
};

export type EventGameConfigDTO = {
  questions_to_pick: Record<Difficulty, number>;
  score_by_level: Record<Difficulty, number>;
};

export type CreateEventGameRequest = {
  game_template_id: number;
  config: EventGameConfigDTO | null;
};

export type UpdateEventGameRequest = {
  config: EventGameConfigDTO;
};

export type AdminEventGameDTO = {
  event_game_id: number;
  event_id: number;
  direction_id: number;
  game_template_id: number;
  title: string;
  description: string;
  engine: GameEngine;
  config: EventGameConfigDTO;
  max_score: number;
  steps_total: number;
};

export type RedemptionListEntryDTO = {
  redemption_id: string;
  event_id: number;
  direction_id: number;
  direction_name: string;
  user_id: number;
  full_name: string;
  email: string;
  reward_type: RewardType;
  redeemed_at: string;
  stander_user_id: number;
  stander_full_name: string;
};

export type RedemptionListPageDTO = {
  event_id: number;
  total: number;
  limit: number;
  offset: number;
  items: RedemptionListEntryDTO[];
};

export type ApiResponse<T> = { data: T };

export type RegisterResponse = ApiResponse<{ access_token: string; user: UserDTO }>;
export type LoginResponse = ApiResponse<{ access_token: string; user: UserDTO }>;
export type RefreshResponse = ApiResponse<{ access_token: string }>;
export type UserResponse = ApiResponse<UserDTO>;
export type EventResponse = ApiResponse<EventDTO>;
export type EventsResponse = ApiResponse<EventDTO[]>;
export type DirectionResponse = ApiResponse<DirectionDTO>;
export type DirectionsResponse = ApiResponse<DirectionDTO[]>;
export type DirectionGamesResponse = ApiResponse<DirectionGamesDTO>;
export type DirectionLeaderboardResponse = ApiResponse<DirectionLeaderboardDTO>;
export type StartOrResumeSessionResponse = ApiResponse<StartOrResumeSessionDTO>;
export type SessionStateResponse = ApiResponse<SessionStateDTO>;
export type SubmitAnswerResponse = ApiResponse<SubmitAnswerDTO>;

// Sprint 3 response types
export type RewardEligibilityResponse = ApiResponse<RewardEligibilityDTO>;
export type RewardQrResponse = ApiResponse<RewardQrDTO>;
export type RedemptionPreviewResponse = ApiResponse<RedemptionPreviewDTO>;
export type RewardRedemptionResponse = ApiResponse<RewardRedemptionDTO>;
export type EventRedemptionResponse = ApiResponse<EventRedemptionDTO>;

export type AdminEventsResponse = ApiResponse<AdminEventDTO[]>;
export type AdminEventResponse = ApiResponse<AdminEventDTO>;
export type AddDirectionResponse = ApiResponse<EventDirectionLinkDTO>;
export type RemoveDirectionResponse = ApiResponse<EventDirectionLinkDTO>;
export type ArchiveEventResponse = ApiResponse<ArchiveEventDTO>;
export type GameTemplatesResponse = ApiResponse<GameTemplateDTO[]>;
export type AdminEventGameResponse = ApiResponse<AdminEventGameDTO>;
export type RedemptionListResponse = ApiResponse<RedemptionListPageDTO>;
