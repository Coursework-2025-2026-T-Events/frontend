import test from "node:test";
import assert from "node:assert/strict";
import { getQuizKeyboardAction } from "../src/features/events/quizKeyboard";

test("moves quiz option focus with arrow keys and wraps around", () => {
  assert.deepEqual(getQuizKeyboardAction("ArrowDown", 0, 3), { type: "move", nextIndex: 1 });
  assert.deepEqual(getQuizKeyboardAction("ArrowRight", 2, 3), { type: "move", nextIndex: 0 });
  assert.deepEqual(getQuizKeyboardAction("ArrowUp", 0, 3), { type: "move", nextIndex: 2 });
  assert.deepEqual(getQuizKeyboardAction("ArrowLeft", 1, 3), { type: "move", nextIndex: 0 });
});

test("moves quiz option focus to boundaries with Home and End", () => {
  assert.deepEqual(getQuizKeyboardAction("Home", 2, 4), { type: "move", nextIndex: 0 });
  assert.deepEqual(getQuizKeyboardAction("End", 0, 4), { type: "move", nextIndex: 3 });
});

test("selects current quiz option with keyboard activation keys", () => {
  assert.deepEqual(getQuizKeyboardAction(" ", 1, 3), { type: "select" });
  assert.deepEqual(getQuizKeyboardAction("Enter", 1, 3), { type: "select" });
});

test("ignores unsupported quiz keyboard input and invalid indexes", () => {
  assert.deepEqual(getQuizKeyboardAction("Tab", 1, 3), { type: "ignore" });
  assert.deepEqual(getQuizKeyboardAction("ArrowDown", -1, 3), { type: "ignore" });
  assert.deepEqual(getQuizKeyboardAction("ArrowDown", 3, 3), { type: "ignore" });
  assert.deepEqual(getQuizKeyboardAction("ArrowDown", 0, 0), { type: "ignore" });
});
