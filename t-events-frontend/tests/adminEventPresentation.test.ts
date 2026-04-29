import test from "node:test";
import assert from "node:assert/strict";
import {
  buildPublishChecklist,
  getDetailsActionLabel,
  getEventLifecycleSummary,
  getSaveStatusText,
  getStatusTone,
} from "../src/features/admin/eventPresentation";

test("returns admin event status presentation with fallback", () => {
  assert.equal(getStatusTone("draft")?.label, "Черновик");
  assert.equal(getStatusTone("custom")?.label, "custom");
  assert.equal(getStatusTone(undefined), null);
});

test("describes admin event lifecycle states", () => {
  assert.equal(getEventLifecycleSummary("published"), "Мероприятие опубликовано, но еще не началось. До старта можно изменить расписание.");
  assert.equal(getEventLifecycleSummary("archived"), "Мероприятие находится в архиве. Бизнес-операции недоступны.");
  assert.equal(getEventLifecycleSummary("unknown"), "Текущий статус мероприятия получен с сервера.");
});

test("builds admin event details action and save status copy", () => {
  assert.equal(getDetailsActionLabel("published"), "Обновить расписание");
  assert.equal(getDetailsActionLabel("draft"), "Сохранить изменения");
  assert.equal(getSaveStatusText(true, null), "Есть несохраненные изменения. Проверка публикации обновится после сохранения.");
  assert.match(getSaveStatusText(false, new Date("2026-05-12T10:30:00Z")), /^Сохранено /);
});

test("builds publish checklist from readiness sections", () => {
  const checklist = buildPublishChecklist({
    detailsReady: true,
    directionsReady: false,
    gamesReady: true,
    publishIssuesBySection: {
      details: [],
      directions: [{ code: "missing_direction", message: "Missing direction", section: "directions" }],
      games: [],
      publish: [{ code: "stale_form", message: "Save changes", section: "publish" }],
    },
  });

  assert.deepEqual(
    checklist.map((item) => ({ id: item.id, ready: item.ready, issueCount: item.issues.length })),
    [
      { id: "details", ready: true, issueCount: 0 },
      { id: "directions", ready: false, issueCount: 1 },
      { id: "games", ready: true, issueCount: 0 },
      { id: "publish", ready: false, issueCount: 1 },
    ],
  );
});
