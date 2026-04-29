import test from "node:test";
import assert from "node:assert/strict";
import { getErrorMessage, getErrorPresentation } from "../src/lib/getErrorMessage";
import { ApiError } from "../src/lib/api/client";

test("returns message from Error instance", () => {
  assert.equal(getErrorMessage(new Error("Ошибка валидации"), "fallback"), "Ошибка валидации");
});

test("uses dedicated presentations for API-client infrastructure errors", () => {
  const network = getErrorPresentation(new ApiError("Network request failed", 0, "network_error"), "fallback");
  const contract = getErrorPresentation(new ApiError("Invalid JSON response", 200, "contract_mismatch"), "fallback");
  const expired = getErrorPresentation(new ApiError("expired", 401, "session_expired"), "fallback");

  assert.equal(network.title, "Проблема с подключением");
  assert.equal(network.retryable, true);
  assert.equal(contract.title, "Некорректный ответ сервера");
  assert.equal(contract.retryable, true);
  assert.equal(expired.message, "Сессия истекла. Войдите снова, чтобы продолжить.");
  assert.equal(expired.retryable, false);
});

test("returns message field from object errors", () => {
  assert.equal(getErrorMessage({ message: "Ошибка API" }, "fallback"), "Ошибка API");
});

test("returns fallback for unknown values", () => {
  assert.equal(getErrorMessage({ message: 123 }, "fallback"), "fallback");
  assert.equal(getErrorMessage(null, "fallback"), "fallback");
});

test("returns human-readable message for known API error codes", () => {
  assert.equal(
    getErrorMessage(new ApiError("raw backend message", 400, "invalid_answer_payload"), "fallback"),
    "Ответ отправлен в неверном формате."
  );
});

test("uses security-aware copy for generic conflicts", () => {
  const presentation = getErrorPresentation(new ApiError("duplicate key", 409, "conflict"), "fallback");

  assert.equal(presentation.title, "Не удалось завершить действие");
  assert.equal(
    presentation.message,
    "Не удалось завершить действие с текущими данными. Проверьте введённые данные или обновите страницу."
  );
  assert.equal(presentation.retryable, false);
});

test("falls back to status presentation for unknown API codes", () => {
  const presentation = getErrorPresentation(new ApiError("raw server message", 503, "unknown_code"), "fallback");

  assert.equal(presentation.title, "Ошибка сервера");
  assert.equal(presentation.message, "На сервере произошла ошибка. Попробуйте позже.");
  assert.equal(presentation.retryable, true);
});

test("marks connection errors as retryable", () => {
  const presentation = getErrorPresentation(new Error("Failed to fetch"), "fallback");

  assert.equal(presentation.title, "Проблема с подключением");
  assert.equal(presentation.message, "Не удалось подключиться к серверу. Проверьте соединение.");
  assert.equal(presentation.retryable, true);
});

test("uses status presentation for unknown English API error messages", () => {
  assert.equal(
    getErrorMessage(new ApiError("backend says no", 400, "unknown_code"), "fallback"),
    "Проверьте заполненные поля."
  );
});

test("translates known English messages", () => {
  assert.equal(getErrorMessage(new Error("Failed to fetch"), "fallback"), "Не удалось подключиться к серверу. Проверьте соединение.");
});
