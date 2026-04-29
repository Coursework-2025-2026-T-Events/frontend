import { expect, test, type Page, type Route } from "@playwright/test";

const demoEvent = {
  event_id: 1,
  title: "Frontend Demo Day",
  description: "Тестовое мероприятие для smoke-проверки каталога.",
  start_time: "2026-06-01T10:00:00Z",
  end_time: "2026-06-01T18:00:00Z",
  status: "published",
};

const participantUser = {
  user_id: 10,
  email: "participant@example.com",
  full_name: "Тестовый участник",
  role: "participant",
};

const standerUser = {
  user_id: 20,
  email: "stander@example.com",
  full_name: "Тестовый стендер",
  role: "stander",
};

const demoDirection = {
  direction_id: 2,
  event_id: 1,
  name: "Frontend",
  description: "Демо-направление для e2e smoke.",
  game_count: 1,
};

const currentQuestion = {
  question_id: 101,
  engine: "question_answer",
  prompt: "Какой цвет у неба?",
  difficulty: "easy",
  score: 10,
  answered: false,
};

const sessionProgress = {
  current_score: 0,
  max_score: 10,
  answered_questions: 0,
  total_questions: 1,
  current_question_index: 1,
};

const sessionNavigation = [{ question_index: 1, question_id: 101, answered: false, is_current: true }];

const activeGameSession = {
  session_id: 900,
  status: "active",
  progress: sessionProgress,
  navigation: sessionNavigation,
  current_question: currentQuestion,
  questions: [currentQuestion],
};

const finishedGameSession = {
  session_id: 900,
  status: "finished",
  answer_result: {
    question_id: 101,
    is_correct: true,
    earned_score: 10,
  },
  progress: {
    ...sessionProgress,
    current_score: 10,
    answered_questions: 1,
  },
  direction_summary: {
    current_direction_score: 10,
    direction_max_score: 10,
    small_reward_threshold: 5,
    big_reward_threshold: 10,
    small_reward_unlocked: true,
    big_reward_unlocked: true,
  },
  next_question: null,
  navigation: [{ question_index: 1, question_id: 101, answered: true, is_current: true }],
  questions: [
    {
      ...currentQuestion,
      answered: true,
      is_correct: true,
      text_answer: "голубой",
    },
  ],
};

const rewardEligibility = {
  event_id: 1,
  direction_id: 2,
  current_direction_score: 10,
  small_reward_threshold: 5,
  big_reward_threshold: 10,
  status: "big_unlocked",
  max_available_reward_type: "big",
  is_qr_available: true,
  event_redemption: {
    is_redeemed: false,
    redeemed_reward_type: null,
    redeemed_from_direction_id: null,
    redeemed_at: null,
  },
};

const rewardQr = {
  qr_id: "qr-e2e-1",
  event_id: 1,
  direction_id: 2,
  reward_type: "big",
  status: "active",
  issued_at: "2026-06-01T10:30:00Z",
  expires_at: "2026-06-01T10:40:00Z",
  signed_token: "signed-e2e-token",
  redeem_code: "A7C3-42K9",
};

const redemptionPreview = {
  event_id: 1,
  event_title: "Frontend Demo Day",
  user_id: 10,
  full_name: "Тестовый участник",
  direction_id: 2,
  reward_type: "big",
  qr_status: "active",
  eligibility_status: "big_unlocked",
  already_redeemed: false,
};

const confirmedRedemption = {
  redemption_id: "redemption-e2e-1",
  event_id: 1,
  user_id: 10,
  full_name: "Тестовый участник",
  direction_id: 2,
  reward_type: "big",
  qr_id: "qr-e2e-1",
  stander_user_id: 20,
  created_at: "2026-06-01T10:35:00Z",
};

const redemptionListPage = {
  event_id: 1,
  total: 1,
  limit: 20,
  offset: 0,
  items: [
    {
      redemption_id: "redemption-e2e-1",
      event_id: 1,
      direction_id: 2,
      direction_name: "Frontend",
      user_id: 10,
      full_name: "Тестовый участник",
      email: "participant@example.com",
      reward_type: "big",
      redeemed_at: "2026-06-01T10:35:00Z",
      stander_user_id: 20,
      stander_full_name: "Тестовый стендер",
    },
  ],
};

async function fulfillJson(route: Route, status: number, value: unknown) {
  await route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(value),
  });
}

async function mockApi(page: Page, options: { events?: unknown[] } = {}) {
  await page.addInitScript(() => {
    localStorage.setItem("t-events-logout-intent", "1");
  });

  await page.route("**/api/v1/**", async (route) => {
    const url = new URL(route.request().url());
    const method = route.request().method();

    if (url.pathname === "/api/v1/auth/refresh") {
      await fulfillJson(route, 401, { error: { code: "unauthorized", message: "Unauthorized" } });
      return;
    }

    if (url.pathname === "/api/v1/events" && method === "GET") {
      await fulfillJson(route, 200, { data: options.events ?? [] });
      return;
    }

    await fulfillJson(route, 404, { error: { code: "not_found", message: "Not found" } });
  });
}

async function mockAuthenticatedApi(page: Page, options: { user?: typeof participantUser | typeof standerUser } = {}) {
  const user = options.user ?? participantUser;

  await page.addInitScript(() => {
    localStorage.removeItem("t-events-logout-intent");
  });

  await page.route("**/api/v1/**", async (route) => {
    const url = new URL(route.request().url());
    const method = route.request().method();

    if (url.pathname === "/api/v1/auth/refresh" && method === "POST") {
      await fulfillJson(route, 200, { data: { access_token: "e2e-access-token" } });
      return;
    }

    if (url.pathname === "/api/v1/me" && method === "GET") {
      await fulfillJson(route, 200, { data: user });
      return;
    }

    if (url.pathname === "/api/v1/events" && method === "GET") {
      await fulfillJson(route, 200, { data: [demoEvent] });
      return;
    }

    if (url.pathname === "/api/v1/events/1/directions" && method === "GET") {
      await fulfillJson(route, 200, { data: [demoDirection] });
      return;
    }

    if (url.pathname === "/api/v1/events/1/directions/2" && method === "GET") {
      await fulfillJson(route, 200, { data: demoDirection });
      return;
    }

    if (url.pathname === "/api/v1/events/1/directions/2/games/3/sessions" && method === "POST") {
      await fulfillJson(route, 200, {
        data: {
          ...activeGameSession,
          game: {
            event_game_id: 3,
            game_template_id: 33,
            title: "Smoke Question",
            engine: "question_answer",
          },
        },
      });
      return;
    }

    if (url.pathname === "/api/v1/events/1/directions/2/games/3/sessions/900" && method === "GET") {
      await fulfillJson(route, 200, { data: activeGameSession });
      return;
    }

    if (url.pathname === "/api/v1/events/1/directions/2/games/3/sessions/900/answers" && method === "POST") {
      await fulfillJson(route, 200, { data: finishedGameSession });
      return;
    }

    if (url.pathname === "/api/v1/me/events/1/directions/2/reward-status" && method === "GET") {
      await fulfillJson(route, 200, { data: rewardEligibility });
      return;
    }

    if (url.pathname === "/api/v1/me/events/1/directions/2/reward-qr" && method === "POST") {
      await fulfillJson(route, 200, { data: rewardQr });
      return;
    }

    if (url.pathname === "/api/v1/stander/redemptions/preview" && method === "POST") {
      await fulfillJson(route, 200, { data: redemptionPreview });
      return;
    }

    if (url.pathname === "/api/v1/stander/redemptions" && method === "POST") {
      await fulfillJson(route, 200, { data: confirmedRedemption });
      return;
    }

    if (url.pathname === "/api/v1/stander/events/1/redemptions" && method === "GET") {
      await fulfillJson(route, 200, { data: redemptionListPage });
      return;
    }

    await fulfillJson(route, 404, { error: { code: "not_found", message: "Not found" } });
  });
}

test.describe("public app smoke", () => {
  test("renders login and register screens", async ({ page }) => {
    await mockApi(page);

    await page.goto("/auth/login");
    await expect(page.getByRole("heading", { name: "Вход" })).toBeVisible();
    await expect(page.getByLabel("Электронная почта")).toBeVisible();
    await expect(page.getByRole("link", { name: "Зарегистрироваться" })).toBeVisible();

    await page.goto("/auth/register");
    await expect(page.getByRole("heading", { name: "Регистрация" })).toBeVisible();
    await expect(page.getByLabel("ФИО")).toBeVisible();
    await expect(page.getByRole("link", { name: "Войти", exact: true })).toBeVisible();
  });

  test("renders events catalog with mocked backend data", async ({ page }) => {
    await mockApi(page, { events: [demoEvent] });

    await page.goto("/events");
    await expect(page.getByRole("heading", { name: "Активные мероприятия" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Frontend Demo Day/ })).toBeVisible();
  });
});

test.describe("protected route smoke", () => {
  test("redirects anonymous users to login with next path", async ({ page }) => {
    await mockApi(page);

    await page.goto("/stander/scan");
    await expect(page).toHaveURL(/\/auth\/login\?next=%2Fstander%2Fscan/);
    await expect(page.getByRole("heading", { name: "Вход" })).toBeVisible();
  });
});

test.describe("game session smoke", () => {
  test("submits a text answer in an authenticated participant session", async ({ page }) => {
    await mockAuthenticatedApi(page);

    await page.goto("/events/1/directions/2/games/3");

    await expect(page.getByRole("heading", { name: "1 задание" })).toBeVisible();
    await expect(page.getByText("Какой цвет у неба?")).toBeVisible();

    await page.getByRole("textbox", { name: "Ответ" }).fill("голубой");
    await page.getByRole("button", { name: "Отправить ответ" }).click();

    await expect(page.getByRole("button", { name: "Ответ принят" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Ответ: Ответ верный" })).toHaveValue("голубой");
  });
});

test.describe("reward smoke", () => {
  test("generates a participant reward QR code automatically", async ({ page }) => {
    await mockAuthenticatedApi(page);

    await page.goto("/events/1/directions/2/reward");

    await expect(page.getByRole("heading", { name: "Большой приз доступен" })).toBeVisible();
    await expect(page.getByText("Направление:")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Код для получения" })).toBeVisible();
    await expect(page.getByText("A7C3-42K9")).toBeVisible();
  });
});

test.describe("stander reward smoke", () => {
  test("confirms a manual redemption code without camera access", async ({ page }) => {
    await mockAuthenticatedApi(page, { user: standerUser });

    await page.goto("/stander/scan");

    await expect(page.getByRole("heading", { name: "Сканирование QR-кодов" })).toBeVisible();
    await page.getByRole("textbox", { name: "Ручной код выдачи" }).fill("A7C3-42K9");
    await page.getByRole("button", { name: "Проверить код" }).click();

    await expect(page.getByRole("heading", { name: "Проверьте выдачу" })).toBeVisible();
    await expect(page.getByText("Тестовый участник #10")).toBeVisible();

    await page.getByRole("button", { name: "Подтвердить выдачу" }).click();

    await expect(page.getByRole("heading", { name: "Выдача подтверждена" })).toBeVisible();
    await expect(page.getByText("redemption-e2e-1")).toBeVisible();
  });

  test("loads the redemption inventory after selecting an event", async ({ page }) => {
    await mockAuthenticatedApi(page, { user: standerUser });

    await page.goto("/stander/inventory");

    await expect(page.getByRole("heading", { name: "Журнал выдачи" })).toBeVisible();
    await page.getByLabel("Мероприятие").selectOption("1");
    await page.getByRole("button", { name: "Показать выдачи" }).click();

    const redemptions = page.getByRole("heading", { name: "Выданные призы" }).locator("xpath=ancestor::section");
    await expect(redemptions.getByRole("heading", { name: "Выданные призы" })).toBeVisible();
    await expect(redemptions.getByText("Frontend Demo Day")).toBeVisible();
    await expect(redemptions.getByText("Тестовый участник").first()).toBeVisible();
    await expect(redemptions.getByText("participant@example.com").first()).toBeVisible();
    await expect(redemptions.getByText("Тестовый стендер").first()).toBeVisible();
  });
});
