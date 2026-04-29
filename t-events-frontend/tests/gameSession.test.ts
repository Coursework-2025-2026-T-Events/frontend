import test from "node:test";
import assert from "node:assert/strict";
import {
  canViewSession,
  formatGamePoints,
  getCurrentQuestionFromSnapshot,
  getDifficultyLabel,
  getLatestGameSessionRuntimeState,
  getNavigationItemState,
  getQuestionByIndex,
  isFinishedSession,
  markCurrentNavigationItem,
  toGameSessionRuntimeState,
  toSubmittedAnswerRuntimeState,
} from "../src/features/events/gameSession";
import type { CurrentQuestionDTO, NavigationItemDTO, SessionStateDTO, SubmitAnswerDTO } from "../src/lib/api/types";

const questions: CurrentQuestionDTO[] = [
  {
    question_id: 10,
    engine: "question_answer",
    prompt: "Question 1",
    difficulty: "easy",
    score: 1,
    answered: false,
  },
  {
    question_id: 20,
    engine: "quiz",
    prompt: "Question 2",
    difficulty: "hard",
    score: 5,
    options: [{ option_id: 1, text: "A" }],
    answered: true,
    selected_option_id: 1,
  },
];

const navigation: NavigationItemDTO[] = [
  { question_index: 1, question_id: 10, answered: false, is_current: true },
  { question_index: 2, question_id: 20, answered: true, is_current: false },
];

const firstNavigationItem = navigation[0];
const secondNavigationItem = navigation[1];
const firstQuestion = questions[0];

if (!firstNavigationItem || !secondNavigationItem || !firstQuestion) {
  throw new Error("Game session test fixtures are incomplete.");
}

test("formats game session labels", () => {
  assert.equal(getDifficultyLabel("easy"), "Лёгкая");
  assert.equal(getDifficultyLabel("medium"), "Средняя");
  assert.equal(getDifficultyLabel("hard"), "Сложная");
  assert.equal(formatGamePoints(1), "1 балл");
  assert.equal(formatGamePoints(2), "2 балла");
  assert.equal(formatGamePoints(11), "11 баллов");
  assert.equal(formatGamePoints(25), "25 баллов");
});

test("derives session visibility and navigation states", () => {
  assert.equal(canViewSession("active"), true);
  assert.equal(canViewSession("finished"), true);
  assert.equal(canViewSession("expired"), false);
  assert.equal(isFinishedSession("finished"), true);
  assert.equal(getNavigationItemState(firstNavigationItem), "current");
  assert.equal(getNavigationItemState(secondNavigationItem), "answered");
  assert.equal(getNavigationItemState({ ...firstNavigationItem, is_current: false }), "skipped");
});

test("resolves current question from navigation snapshots", () => {
  assert.equal(getCurrentQuestionFromSnapshot(questions, navigation)?.question_id, 10);
  assert.equal(getQuestionByIndex(questions, navigation, 2)?.question_id, 20);
  assert.equal(getQuestionByIndex(questions, [], 2)?.question_id, 20);
  assert.equal(getQuestionByIndex(questions, navigation, null), null);
});

test("normalizes session DTO into runtime state", () => {
  const state: SessionStateDTO = {
    session_id: 5,
    status: "active",
    progress: {
      current_score: 0,
      max_score: 6,
      answered_questions: 0,
      total_questions: 2,
      current_question_index: 1,
    },
    navigation,
    current_question: firstQuestion,
  };

  assert.deepEqual(toGameSessionRuntimeState(state).questions, []);
  assert.deepEqual(
    markCurrentNavigationItem(navigation, 2).map((item) => item.is_current),
    [false, true],
  );
});

test("normalizes submitted answers and selects the latest runtime state", () => {
  const submitAnswer: SubmitAnswerDTO = {
    session_id: 9,
    status: "active",
    answer_result: {
      question_id: 10,
      is_correct: true,
      earned_score: 1,
    },
    progress: {
      current_score: 1,
      max_score: 6,
      answered_questions: 1,
      total_questions: 2,
      current_question_index: 2,
    },
    direction_summary: {
      current_direction_score: 1,
      direction_max_score: 6,
      small_reward_threshold: 3,
      big_reward_threshold: 5,
      small_reward_unlocked: false,
      big_reward_unlocked: false,
    },
    next_question: firstQuestion,
    navigation,
    questions,
  };

  const submittedState = toSubmittedAnswerRuntimeState(submitAnswer);

  assert.equal(submittedState.current_question?.question_id, 10);
  assert.equal(getLatestGameSessionRuntimeState([
    { timestamp: 1, state: toGameSessionRuntimeState({ ...submitAnswer, current_question: firstQuestion }) },
    { timestamp: 2, state: submittedState },
  ])?.session_id, 9);
});
