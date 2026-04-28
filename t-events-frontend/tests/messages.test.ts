import test from "node:test";
import assert from "node:assert/strict";
import { uiMessages } from "../src/lib/messages";

test("keeps shared UI state messages in Russian", () => {
  assert.equal(uiMessages.loading, "Загрузка...");
  assert.equal(uiMessages.defaultErrorTitle, "Не удалось загрузить данные");
});
