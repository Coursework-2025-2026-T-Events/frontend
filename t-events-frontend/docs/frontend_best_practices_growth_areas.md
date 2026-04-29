# Зоны роста frontend до уровня профессиональных best practices

Документ фиксирует актуальные направления улучшения клиентской части T-Events. Цель - довести проект до уровня современной production-ready frontend-разработки: чистый код, предсказуемая архитектура, строгая типизация, устойчивость к ошибкам, отсутствие deprecated-подходов и полноценный контроль качества.

## 1. Чистота кодовой базы и кодировка

**Проблема.** В части файлов могут встречаться поврежденные русские строки в формате mojibake. Это влияет на пользовательский интерфейс, документацию и качество репозитория.

**Что улучшить.**

- Привести все исходные файлы, README и документацию к UTF-8.
- Исправить поврежденные пользовательские строки в `src/app`, `src/components`, `src/features`, `README.md` и релевантных `docs`.
- Добавить автоматическую проверку на mojibake-паттерны в CI.
- Добавить editor config для единых правил кодировки, переводов строк и финальной новой строки.
- Исключить из git служебные dev log-файлы, build artifacts и локальные временные файлы.

**Ожидаемый результат.** Интерфейс и документация отображаются корректно, а репозиторий не накапливает случайные артефакты разработки.

## 2. Современное использование Next.js App Router

**Проблема.** Многие страницы в `src/app` помечены `"use client"`. Это упрощает разработку, но снижает пользу App Router: server components, streaming, route-level loading/error UI и меньший client bundle используются ограниченно.

**Что улучшить.**

- Оставлять `page.tsx` и `layout.tsx` server components по умолчанию.
- Выносить интерактивные части в отдельные `*Client.tsx` компоненты.
- Использовать `"use client"` только на реальных client boundaries.
- Добавить route-level файлы:
  - `loading.tsx`;
  - `error.tsx`;
  - `not-found.tsx`.
- Для динамических маршрутов явно обрабатывать отсутствующие сущности через `notFound()`.
- Использовать `<Link>` для обычной навигации, а `useRouter` оставлять для сценариев, где действительно нужна программная навигация.

**Ожидаемый результат.** Меньше клиентского JavaScript, лучше загрузка страниц, понятнее границы ответственности между серверным и клиентским кодом.

## 3. Отказ от deprecated и legacy-подходов

**Текущее состояние.** В проекте не обнаружены явные устаревшие React API вроде `ReactDOM.render`, `findDOMNode`, class lifecycle methods, string refs, `componentWill*`, `UNSAFE_*`, `@ts-ignore` или `dangerouslySetInnerHTML`.

**Что улучшить.**

- Зафиксировать запрет на legacy React APIs через ESLint-правила и code review checklist.
- Не использовать class components в новом коде.
- Не использовать legacy context, string refs, `findDOMNode`, `ReactDOM.render`, `createFactory`.
- Не добавлять `@ts-ignore` без отдельного обоснования и issue.
- Не отключать ESLint локально без комментария с причиной.
- Периодически запускать dependency audit и проверять changelog при обновлении Next.js, React, React Query, Zustand и Tailwind.
- Следить за deprecated warnings в build/test output.

**Ожидаемый результат.** Кодовая база остается совместимой с актуальными версиями React/Next.js и не копит технический долг вокруг устаревших API.

## 4. Строгая типизация и TypeScript-дисциплина

**Проблема.** В проекте включен `strict`, но конфигурацию можно усилить. Сейчас DTO описаны вручную, а реальные API-ответы приводятся к типам через `as T`.

**Что улучшить.**

- Добавить отдельный скрипт `typecheck`.
- Рассмотреть усиление `tsconfig`:
  - `allowJs: false`;
  - `noUncheckedIndexedAccess: true`;
  - `exactOptionalPropertyTypes: true`;
  - `noImplicitOverride: true`.
- Минимизировать type assertions `as T`, особенно на границе API.
- Ввести типизированные query keys для React Query.
- Вынести общие domain-типы из UI-страниц в feature/model-слой.
- Запретить неявное расширение DTO внутри компонентов.

**Ожидаемый результат.** Ошибки контрактов, nullable-состояний и неверных индексов ловятся на этапе разработки, а не в браузере пользователя.

## 5. API-контракт и runtime-валидация

**Проблема.** Frontend DTO поддерживаются вручную. TypeScript не гарантирует, что backend действительно вернул данные нужной формы.

**Что улучшить.**

- Сделать OpenAPI-контракт источником истины.
- Генерировать frontend-типы из OpenAPI.
- Разделить generated DTO и frontend domain models.
- Добавить runtime-валидацию критичных ответов через `zod` или аналог:
  - auth;
  - refresh;
  - текущий пользователь;
  - game session state;
  - submit answer;
  - reward eligibility;
  - QR generation;
  - stander redemption preview/confirm;
  - admin event settings.
- Добавить contract tests для ключевых API-сценариев.
- Явно обрабатывать contract mismatch как отдельный тип ошибки.

**Ожидаемый результат.** Frontend устойчив к несовместимым изменениям backend и быстрее выявляет расхождения API.

## 6. Архитектура feature-модулей и декомпозиция

**Проблема.** Некоторые страницы совмещают UI, бизнес-логику, формы, запросы, форматирование дат и обработку ошибок. Особенно это заметно в административном разделе.

**Что улучшить.**

- Разделить крупные страницы на:
  - route-level shell;
  - client container;
  - presentational components;
  - feature hooks;
  - pure domain helpers.
- Для admin event page выделить:
  - `EventDetailsForm`;
  - `ScheduleForm`;
  - `DirectionsPanel`;
  - `GamesPanel`;
  - `PublishPanel`;
  - `useAdminEventForm`;
  - `useGameConfigForm`.
- Вынести форматирование дат, статусов, labels и validation helpers из страниц.
- Ограничить размер компонентов и количество обязанностей в одном файле.
- Поддерживать правило: страница собирает сценарий, feature-компоненты реализуют доменную логику, UI-компоненты остаются переиспользуемыми и нейтральными.

**Ожидаемый результат.** Код проще сопровождать, тестировать и изменять без каскадных регрессий.

## 7. Auth lifecycle и безопасность сессии

**Проблема.** Авторизация работает, но состояние сессии лучше оформить как явную модель. Logout на frontend должен быть связан с backend logout и отзывом refresh-сессии.

**Что улучшить.**

- Ввести auth state machine:
  - `unknown`;
  - `refreshing`;
  - `anonymous`;
  - `authenticated`;
  - `expired`;
  - `logout_in_progress`.
- Реализовать server-side logout endpoint и вызов его из frontend.
- Очищать refresh cookie на backend.
- Синхронизировать logout/login между вкладками через `BroadcastChannel` и fallback на storage events.
- Явно описать поведение при:
  - reload страницы;
  - истекшем access token;
  - истекшем refresh token;
  - ошибке refresh;
  - ручном logout;
  - параллельных запросах.
- Добавить тесты на все edge cases auth lifecycle.

**Ожидаемый результат.** Пользовательская сессия ведет себя предсказуемо, безопасно и одинаково во всех вкладках.

## 8. Формы и валидация

**Проблема.** В проекте есть `react-hook-form` и `zod`, но часть форм и validation flow реализована вручную.

**Что улучшить.**

- Унифицировать формы через `react-hook-form`.
- Описывать схемы формы через `zod`.
- Разделять client validation и server validation.
- Привести ошибки полей к единому формату.
- Упростить повторяющиеся form state patterns.
- Использовать accessible error summary для сложных admin-форм.
- Добавить тесты на схемы и преобразование payload.

**Ожидаемый результат.** Формы становятся предсказуемыми, проще тестируются и дают единый UX ошибок.

## 9. UI-система и дизайн-дисциплина

**Проблема.** UI-примитивы уже есть, но дизайн-система пока не полностью формализована. В компонентах много inline Tailwind-композиций и локальных вариантов.

**Что улучшить.**

- Описать design tokens: цвета, spacing, typography, radius, shadows, z-index.
- Уменьшить дублирование Tailwind-классов через варианты компонентов.
- Добавить единые size/variant APIs для `Button`, `Input`, `Select`, `Card`, `Badge`.
- Проверить все интерактивные элементы на стабильные размеры и отсутствие layout shift.
- Вынести domain labels и status presentation в отдельные модули.
- Подготовить визуальный каталог UI-компонентов или Storybook/Ladle.
- Добавить visual regression для критичных экранов.

**Ожидаемый результат.** Интерфейс становится консистентным, а изменения UI меньше ломают соседние сценарии.

## 10. Accessibility

**Проблема.** Базовая accessibility-поддержка есть, но профессиональный уровень требует системной проверки.

**Что улучшить.**

- Добавить automated accessibility checks в Playwright.
- Проверить все страницы keyboard-only навигацией.
- Проверить focus order и focus trap для меню/модалок.
- Проверить contrast ratio для текста, бейджей и disabled-состояний.
- Добавить понятные `aria-label` только там, где видимого текста недостаточно.
- Убедиться, что loading states не создают лишний шум для screen reader.
- Проверить QR/scan flow на доступность без камеры и с ручным вводом.

**Ожидаемый результат.** Основные сценарии доступны не только визуально, но и через клавиатуру и assistive technologies.

## 11. Тестирование

**Проблема.** Unit-тесты есть и проходят, но нет полноценного e2e-слоя и визуального контроля.

**Что улучшить.**

- Добавить Playwright config.
- Добавить e2e smoke suite:
  - регистрация;
  - вход;
  - refresh сессии;
  - protected routes;
  - выбор мероприятия;
  - выбор направления;
  - прохождение quiz;
  - прохождение question-answer;
  - генерация QR;
  - preview QR стендером;
  - подтверждение выдачи;
  - создание/публикация мероприятия администратором.
- Добавить mock backend layer для стабильных e2e.
- Добавить integration tests для API-client + React Query hooks.
- Добавить regression tests для auth edge cases.
- Добавить visual/a11y проверки для ключевых экранов.

**Ожидаемый результат.** Основные пользовательские сценарии проверяются автоматически перед релизом.

## 12. Error handling и observability

**Проблема.** Ошибки API локализуются, но нет полноценной клиентской наблюдаемости.

**Что улучшить.**

- Добавить route-level `error.tsx` для критичных разделов.
- Добавить global error boundary.
- Подключить Sentry или аналог.
- Логировать:
  - runtime UI crashes;
  - API contract mismatch;
  - unexpected API errors;
  - failed critical mutations;
  - scanner/camera errors.
- Передавать request id из backend в error context.
- Не логировать access token, refresh token, QR signed token, персональные данные сверх необходимого.
- Добавить user-safe error messages и developer diagnostics separately.

**Ожидаемый результат.** Ошибки пользователей можно расследовать без воспроизведения вручную и без утечки чувствительных данных.

## 13. Производительность

**Проблема.** Проект собирается успешно, но производительность нужно контролировать отдельными метриками и бюджетами.

**Что улучшить.**

- Анализировать client bundle.
- Сократить количество client components.
- Lazy-load тяжелые зоны:
  - QR scanner;
  - admin panels;
  - charts/leaderboard при необходимости.
- Проверить изображения и убрать `unoptimized`, где оно не требуется.
- Добавить performance budgets.
- Использовать route-level streaming/loading UI.
- Проверить Core Web Vitals на основных страницах.

**Ожидаемый результат.** Приложение быстрее загружается, особенно на мобильных устройствах и слабом соединении.

## 14. Dependency management и supply chain

**Проблема.** Зависимости актуальны, но нужен регулярный контроль обновлений и уязвимостей.

**Что улучшить.**

- Добавить `npm audit` или отдельный security scan в CI.
- Настроить Dependabot/Renovate.
- Фиксировать major upgrades отдельными PR.
- Проверять changelog при обновлении Next.js, React, React Query, Zustand, Tailwind.
- Удалять неиспользуемые зависимости.
- Разделять runtime dependencies и devDependencies.
- Проверять license compatibility при добавлении новых пакетов.

**Ожидаемый результат.** Обновления становятся управляемыми, а deprecated или vulnerable dependencies не остаются незамеченными.

## 15. CI/CD и quality gates

**Проблема.** Локальные команды есть, но профессиональный процесс требует обязательных проверок перед merge/release.

**Что улучшить.**

- Настроить CI pipeline:
  - install with `npm ci`;
  - lint;
  - typecheck;
  - unit tests;
  - e2e smoke tests;
  - build;
  - dependency audit;
  - mojibake check.
- Добавить branch protection.
- Генерировать test/build artifacts.
- Проверять Docker build.
- Добавить preview deployment для frontend.

**Ожидаемый результат.** В main не попадают изменения, которые ломают сборку, типы, тесты, интерфейсные тексты или базовые пользовательские сценарии.

## 16. Документация для сопровождения

**Проблема.** README и проектная документация есть, но нужна документация именно для команды сопровождения frontend.

**Что улучшить.**

- Описать frontend architecture decision records.
- Добавить соглашения:
  - naming;
  - file structure;
  - feature boundaries;
  - query keys;
  - error handling;
  - form validation;
  - testing strategy.
- Описать процесс добавления нового API endpoint.
- Описать процесс добавления новой страницы.
- Описать release checklist.
- Описать troubleshooting для auth, QR scanner, Docker и backend proxy.

**Ожидаемый результат.** Новому разработчику проще безопасно вносить изменения, а проект меньше зависит от неформальных знаний.

## Приоритетный roadmap

### Этап 1. Hygiene и базовая профессиональная дисциплина

1. Исправить кодировку и добавить mojibake check.
2. Убрать dev log-файлы из git.
3. Добавить `typecheck`.
4. Усилить `tsconfig`.
5. Добавить `loading.tsx`, `error.tsx`, `not-found.tsx`.
6. Настроить CI для `lint`, `typecheck`, `test`, `build`.

### Этап 2. Архитектура и устойчивость

1. Разделить крупные client pages на server shell + client components.
2. Декомпозировать admin event page.
3. Ввести auth state machine.
4. Добавить backend logout integration.
5. Синхронизировать auth-события между вкладками.
6. Вынести labels, date formatting и domain presentation из страниц.

### Этап 3. Контракты и тесты

1. Подключить OpenAPI-generated types.
2. Добавить runtime validation для критичных API-ответов.
3. Добавить Playwright e2e smoke suite.
4. Добавить a11y checks.
5. Добавить visual regression для ключевых экранов.
6. Покрыть auth edge cases.

### Этап 4. Production readiness

1. Подключить frontend observability.
2. Добавить bundle/performance budgets.
3. Настроить dependency/security scanning.
4. Подготовить preview deployments.
5. Описать release checklist и frontend runbook.

## Ориентиры по актуальным практикам

- Next.js App Router использует Server Components по умолчанию; Client Components стоит применять для интерактивности, event handlers, effects и browser-only APIs.
- Директива `"use client"` задает client-server boundary и не должна ставиться во все файлы автоматически.
- Для App Router предусмотрены специальные файлы `loading.tsx`, `error.tsx`, `not-found.tsx`.
- React помечает ряд API как legacy/not recommended for new code, а часть старых API удалена в React 19.
- `eslint-config-next/core-web-vitals` и TypeScript-настройки Next.js стоит использовать как базовый минимум контроля качества.

## Использованные источники

- Next.js documentation: Server and Client Components - https://nextjs.org/docs/app/getting-started/server-and-client-components
- Next.js documentation: `use client` directive - https://nextjs.org/docs/app/api-reference/directives/use-client
- Next.js documentation: `loading.js` file convention - https://nextjs.org/docs/app/api-reference/file-conventions/loading
- Next.js documentation: `error.js` file convention - https://nextjs.org/docs/app/api-reference/file-conventions/error
- Next.js documentation: `not-found.js` file convention - https://nextjs.org/docs/app/api-reference/file-conventions/not-found
- Next.js documentation: ESLint configuration - https://nextjs.org/docs/app/api-reference/config/eslint
- React documentation: Legacy React APIs - https://react.dev/reference/react/legacy
