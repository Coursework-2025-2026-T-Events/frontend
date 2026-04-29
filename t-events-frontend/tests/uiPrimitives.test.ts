import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import EmptyState from "../src/components/ui/EmptyState";
import ErrorMessage from "../src/components/ui/ErrorMessage";
import FormErrorSummary from "../src/components/ui/FormErrorSummary";
import LiveStatus from "../src/components/ui/LiveStatus";
import LoadingState from "../src/components/ui/LoadingState";
import PageHeader from "../src/components/ui/PageHeader";
import Select from "../src/components/ui/Select";
import Textarea from "../src/components/ui/Textarea";

test("Select connects label and error state to the native control", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      Select,
      { label: "Тип приза", error: "Выберите тип", value: "", onChange: () => undefined },
      React.createElement("option", { value: "" }, "Все")
    )
  );

  assert.match(html, /<label class="block" for="[^"]+">/);
  assert.match(html, /<select[^>]+aria-invalid="true"/);
  assert.match(html, /<select[^>]+aria-describedby="[^"]+-error"/);
  assert.match(html, /role="alert"/);
});

test("Textarea exposes the same accessible error contract as text inputs", () => {
  const html = renderToStaticMarkup(
    React.createElement(Textarea, {
      label: "Описание",
      error: "Заполните описание",
      defaultValue: "Короткое описание",
    })
  );

  assert.match(html, /<label class="block" for="[^"]+">/);
  assert.match(html, /<textarea[^>]+aria-invalid="true"/);
  assert.match(html, /<textarea[^>]+aria-describedby="[^"]+-error"/);
  assert.match(html, /Заполните описание/);
});

test("LiveStatus announces transient status and marks busy work", () => {
  const html = renderToStaticMarkup(
    React.createElement(LiveStatus, { centered: true, busy: true }, "Проверяем вход...")
  );

  assert.match(html, /role="status"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /aria-busy="true"/);
  assert.match(html, /Проверяем вход/);
});

test("ErrorMessage exposes alert semantics and optional recovery action", () => {
  const html = renderToStaticMarkup(
    React.createElement(ErrorMessage, {
      title: "Ошибка загрузки",
      message: "Не удалось загрузить мероприятия",
      actionLabel: "Повторить",
      onAction: () => undefined,
    })
  );

  assert.match(html, /role="alert"/);
  assert.match(html, /Ошибка загрузки/);
  assert.match(html, /Не удалось загрузить мероприятия/);
  assert.match(html, /Повторить/);
});

test("FormErrorSummary announces errors and links to invalid fields", () => {
  const html = renderToStaticMarkup(
    React.createElement(FormErrorSummary, {
      items: [
        {
          label: "Название",
          message: "Заполните название",
          fieldId: "event-title",
        },
      ],
    }),
  );

  assert.match(html, /role="alert"/);
  assert.match(html, /aria-live="assertive"/);
  assert.match(html, /href="#event-title"/);
  assert.match(html, /Название: Заполните название/);
});

test("LoadingState wraps busy progress in a polite live region", () => {
  const html = renderToStaticMarkup(React.createElement(LoadingState, { message: "Загрузка мероприятий..." }));

  assert.match(html, /role="status"/);
  assert.match(html, /aria-busy="true"/);
  assert.match(html, /Загрузка мероприятий/);
});

test("EmptyState renders optional recovery navigation", () => {
  const html = renderToStaticMarkup(
    React.createElement(EmptyState, {
      title: "Направление еще не выбрано",
      description: "Откройте список мероприятий.",
      actionLabel: "К мероприятиям",
      actionHref: "/events",
    })
  );

  assert.match(html, /Направление еще не выбрано/);
  assert.match(html, /Откройте список мероприятий/);
  assert.match(html, /href="\/events"/);
});

test("PageHeader keeps page title and supporting copy together", () => {
  const html = renderToStaticMarkup(
    React.createElement(PageHeader, {
      title: "Активные мероприятия",
      description: "Выберите мероприятие для участия.",
    })
  );

  assert.match(html, /<h1[^>]*>Активные мероприятия<\/h1>/);
  assert.match(html, /Выберите мероприятие для участия/);
});
