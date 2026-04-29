import type { KeyboardEvent, MutableRefObject, ReactNode } from "react";
import clsx from "clsx";
import { ArrowLeft, Check, Loader2, X } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { getErrorMessage } from "@/lib/getErrorMessage";
import type { CurrentQuestionDTO, NavigationItemDTO, QuizQuestionOptionDTO, StepBasedProgressDTO } from "@/lib/api/types";
import { routes } from "@/lib/routes";
import { formatGamePoints, getDifficultyLabel, getNavigationItemState } from "./gameSession";

type QuestionNavigationProps = {
  items: NavigationItemDTO[];
  disabled: boolean;
  onSelect: (item: NavigationItemDTO) => void;
  variant?: "grid" | "scroll";
};

export function GameSessionBackLink({ directionId, eventId }: { directionId: number; eventId: number }) {
  return (
    <Button
      variant="ghost"
      href={routes.eventDirectionGames(eventId, directionId)}
      className="-ml-3 min-h-10 gap-2 px-3 text-[15px] font-normal text-[var(--color-brand-muted)] hover:bg-[var(--color-brand-panel)]"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden />
      К играм
    </Button>
  );
}

export function GameSessionInitialLoading() {
  return (
    <div className="mt-8 flex items-center gap-3 text-[15px] leading-6 text-[var(--color-brand-graphite)]" role="status">
      <Loader2 className="h-5 w-5 animate-spin text-[var(--color-brand-ink)]" aria-hidden />
      Загрузка игровой сессии...
    </div>
  );
}

export function GameSessionInitialError({ error }: { error: unknown }) {
  return (
    <div className="mt-8 rounded-[var(--radius-lg)] bg-red-50 p-5 text-[15px] leading-6 text-red-700" role="alert">
      {getErrorMessage(error, "Не удалось открыть игровую сессию")}
    </div>
  );
}

export function GameSessionQuestionSkeleton() {
  return (
    <section className="min-h-[260px] animate-pulse rounded-[var(--radius-lg)] bg-[var(--color-brand-panel)] p-5 sm:min-h-[320px] sm:p-6" role="status" aria-label="Загрузка задания">
      <div className="h-8 w-44 rounded-full bg-[#e3e6ec]" />
      <div className="mt-8 h-6 max-w-3xl rounded-full bg-[#e3e6ec]" />
      <div className="mt-4 h-6 max-w-2xl rounded-full bg-[#e3e6ec]" />
      <div className="mt-10 h-14 max-w-xl rounded-[var(--radius-md)] bg-[#e3e6ec]" />
    </section>
  );
}

type GameSessionQuestionPanelProps = {
  answerResultLabel: string | null;
  canNavigateQuestions: boolean;
  canSubmit: boolean;
  currentQuestion: CurrentQuestionDTO;
  currentQuestionNumber: number | null;
  displayedAnswerText: string;
  displayedSelectedOptionId: number | null;
  isAnsweredQuestion: boolean;
  isCorrectAnsweredQuestion: boolean;
  isReviewMode: boolean;
  isSelectQuestionPending: boolean;
  isSubmitPending: boolean;
  isWrongAnsweredQuestion: boolean;
  nextNavigationItem: NavigationItemDTO | null;
  quizOptionRefs: MutableRefObject<Record<number, HTMLButtonElement | null>>;
  submitError: unknown;
  onAnswerTextChange: (value: string) => void;
  onNextQuestion: (item: NavigationItemDTO) => void;
  onQuizKeyDown: (event: KeyboardEvent<HTMLButtonElement>, options: QuizQuestionOptionDTO[], index: number) => void;
  onSelectOption: (optionId: number) => void;
  onSubmit: () => void;
};

export function GameSessionQuestionPanel({
  answerResultLabel,
  canNavigateQuestions,
  canSubmit,
  currentQuestion,
  currentQuestionNumber,
  displayedAnswerText,
  displayedSelectedOptionId,
  isAnsweredQuestion,
  isCorrectAnsweredQuestion,
  isReviewMode,
  isSelectQuestionPending,
  isSubmitPending,
  isWrongAnsweredQuestion,
  nextNavigationItem,
  quizOptionRefs,
  submitError,
  onAnswerTextChange,
  onNextQuestion,
  onQuizKeyDown,
  onSelectOption,
  onSubmit,
}: GameSessionQuestionPanelProps) {
  return (
    <section>
      {isReviewMode && (
        <div className="mb-6 rounded-[var(--radius-lg)] bg-[#f1f3f6] px-4 py-3 text-[14px] leading-5 text-[var(--color-brand-graphite)]">
          Игра завершена. Можно посмотреть ответы и результат, но изменить ответы уже нельзя.
        </div>
      )}

      <GameQuestionHeader currentQuestion={currentQuestion} currentQuestionNumber={currentQuestionNumber} />

      <div className="mt-6 max-w-3xl sm:mt-7">
        <p className="text-[18px] leading-7 text-[var(--color-brand-ink)] sm:text-[20px] sm:leading-8">{currentQuestion.prompt}</p>
      </div>

      {currentQuestion.engine === "question_answer" && (
        <TextAnswerField
          answerResultLabel={answerResultLabel}
          displayedAnswerText={displayedAnswerText}
          isAnsweredQuestion={isAnsweredQuestion}
          isCorrectAnsweredQuestion={isCorrectAnsweredQuestion}
          isWrongAnsweredQuestion={isWrongAnsweredQuestion}
          onAnswerTextChange={onAnswerTextChange}
        />
      )}

      {currentQuestion.engine === "quiz" && (
        <QuizAnswerOptions
          displayedSelectedOptionId={displayedSelectedOptionId}
          isAnsweredQuestion={isAnsweredQuestion}
          isCorrectAnsweredQuestion={isCorrectAnsweredQuestion}
          isWrongAnsweredQuestion={isWrongAnsweredQuestion}
          options={currentQuestion.options}
          quizOptionRefs={quizOptionRefs}
          onQuizKeyDown={onQuizKeyDown}
          onSelectOption={onSelectOption}
        />
      )}

      <GameSessionQuestionActions
        canNavigateQuestions={canNavigateQuestions}
        canSubmit={canSubmit}
        isAnsweredQuestion={isAnsweredQuestion}
        isReviewMode={isReviewMode}
        isSelectQuestionPending={isSelectQuestionPending}
        isSubmitPending={isSubmitPending}
        nextNavigationItem={nextNavigationItem}
        submitError={submitError}
        onNextQuestion={onNextQuestion}
        onSubmit={onSubmit}
      />
    </section>
  );
}

function GameQuestionHeader({ currentQuestion, currentQuestionNumber }: { currentQuestion: CurrentQuestionDTO; currentQuestionNumber: number | null }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <h1 className="text-[22px] font-bold leading-7 text-[var(--color-brand-ink)] sm:text-[26px] sm:leading-8">
        {currentQuestionNumber ?? currentQuestion.question_id} задание
      </h1>
      <span className="rounded-full bg-[var(--color-brand-panel)] px-3 py-1 text-[13px] font-medium leading-[18px] text-[var(--color-brand-graphite)]">
        {getDifficultyLabel(currentQuestion.difficulty)}
      </span>
      <span className="rounded-full bg-[#dff4e8] px-3 py-1 text-[15px] leading-5 text-[#237a3b]">
        {formatGamePoints(currentQuestion.score)}
      </span>
    </div>
  );
}

function TextAnswerField({
  answerResultLabel,
  displayedAnswerText,
  isAnsweredQuestion,
  isCorrectAnsweredQuestion,
  isWrongAnsweredQuestion,
  onAnswerTextChange,
}: {
  answerResultLabel: string | null;
  displayedAnswerText: string;
  isAnsweredQuestion: boolean;
  isCorrectAnsweredQuestion: boolean;
  isWrongAnsweredQuestion: boolean;
  onAnswerTextChange: (value: string) => void;
}) {
  return (
    <div className="mt-7 max-w-2xl sm:mt-8">
      <div className="relative">
        <Input
          value={displayedAnswerText}
          onChange={(event) => onAnswerTextChange(event.target.value)}
          placeholder="Введите ответ"
          readOnly={isAnsweredQuestion}
          aria-readonly={isAnsweredQuestion}
          aria-invalid={isWrongAnsweredQuestion || undefined}
          aria-label={answerResultLabel ? `Ответ: ${answerResultLabel}` : "Ответ"}
          className={clsx(
            "h-14 pr-12 text-[16px]",
            isCorrectAnsweredQuestion && "border-[#47b86a] !bg-[#f2fbf5] text-[#1f6f36] focus:border-[#2f9d50]",
            isWrongAnsweredQuestion && "border-[#dc6b63] !bg-[#fff5f5] text-[#9f2f2f] focus:border-[#c73a3a]",
          )}
        />
        {isCorrectAnsweredQuestion && <Check className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#237a3b]" aria-hidden />}
        {isWrongAnsweredQuestion && <X className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#c73a3a]" aria-hidden />}
      </div>
    </div>
  );
}

function QuizAnswerOptions({
  displayedSelectedOptionId,
  isAnsweredQuestion,
  isCorrectAnsweredQuestion,
  isWrongAnsweredQuestion,
  options,
  quizOptionRefs,
  onQuizKeyDown,
  onSelectOption,
}: {
  displayedSelectedOptionId: number | null;
  isAnsweredQuestion: boolean;
  isCorrectAnsweredQuestion: boolean;
  isWrongAnsweredQuestion: boolean;
  options: QuizQuestionOptionDTO[];
  quizOptionRefs: MutableRefObject<Record<number, HTMLButtonElement | null>>;
  onQuizKeyDown: (event: KeyboardEvent<HTMLButtonElement>, options: QuizQuestionOptionDTO[], index: number) => void;
  onSelectOption: (optionId: number) => void;
}) {
  return (
    <div className="mt-7 grid max-w-3xl gap-3 sm:mt-8 sm:gap-4" role="radiogroup" aria-label="Варианты ответа">
      {options.map((option, index) => {
        const selected = displayedSelectedOptionId === option.option_id;

        return (
          <button
            key={option.option_id}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected || (displayedSelectedOptionId === null && index === 0) ? 0 : -1}
            ref={(element) => {
              quizOptionRefs.current[option.option_id] = element;
            }}
            className={clsx(
              "group flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-3 text-left text-[16px] leading-6 outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--color-brand-black)] focus-visible:ring-offset-4 disabled:cursor-default sm:gap-5 sm:py-2 sm:text-[20px] sm:leading-8",
              selected && !isAnsweredQuestion && "bg-[#eceff4] text-[var(--color-brand-ink)] ring-1 ring-inset ring-[#cfd5df]",
              selected && isCorrectAnsweredQuestion && "bg-[#f2fbf5] text-[#237a3b]",
              selected && isWrongAnsweredQuestion && "bg-[#fff5f5] text-red-700",
            )}
            disabled={isAnsweredQuestion}
            onClick={() => onSelectOption(option.option_id)}
            onKeyDown={(event) => onQuizKeyDown(event, options, index)}
          >
            <span
              className={clsx(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-panel)] text-transparent transition sm:h-8 sm:w-8",
                selected && !isAnsweredQuestion && "bg-white text-[#8a94a6] ring-1 ring-inset ring-[#c2cad6]",
                selected && isCorrectAnsweredQuestion && "bg-[#dff4e8] text-[#4bd36b]",
                selected && isWrongAnsweredQuestion && "bg-red-50 text-red-500",
              )}
              aria-hidden
            >
              <span className="h-3 w-3 rounded-full bg-current sm:h-3.5 sm:w-3.5" />
            </span>
            <span>{option.text}</span>
          </button>
        );
      })}
    </div>
  );
}

function GameSessionQuestionActions({
  canNavigateQuestions,
  canSubmit,
  isAnsweredQuestion,
  isReviewMode,
  isSelectQuestionPending,
  isSubmitPending,
  nextNavigationItem,
  submitError,
  onNextQuestion,
  onSubmit,
}: {
  canNavigateQuestions: boolean;
  canSubmit: boolean;
  isAnsweredQuestion: boolean;
  isReviewMode: boolean;
  isSelectQuestionPending: boolean;
  isSubmitPending: boolean;
  nextNavigationItem: NavigationItemDTO | null;
  submitError: unknown;
  onNextQuestion: (item: NavigationItemDTO) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="mt-8 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:items-center">
      <Button className="min-h-14 w-full px-7 text-[16px] sm:w-auto" disabled={isAnsweredQuestion || !canSubmit || isSubmitPending} onClick={onSubmit}>
        {getSubmitButtonContent({ isAnsweredQuestion, isReviewMode, isSubmitPending })}
      </Button>

      {nextNavigationItem && (
        <Button
          variant="secondary"
          className="min-h-14 w-full px-7 text-[16px] sm:w-auto"
          disabled={!canNavigateQuestions || isSelectQuestionPending}
          onClick={() => onNextQuestion(nextNavigationItem)}
        >
          Следующий вопрос
        </Button>
      )}

      {Boolean(submitError) && (
        <p className="text-[14px] leading-5 text-red-600">
          {getErrorMessage(submitError, "Не удалось отправить ответ")}
        </p>
      )}
    </div>
  );
}

function getSubmitButtonContent({
  isAnsweredQuestion,
  isReviewMode,
  isSubmitPending,
}: {
  isAnsweredQuestion: boolean;
  isReviewMode: boolean;
  isSubmitPending: boolean;
}): ReactNode {
  if (isAnsweredQuestion) return "Ответ принят";
  if (isReviewMode) return "Игра завершена";
  if (!isSubmitPending) return "Отправить ответ";

  return (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
      Отправляем...
    </>
  );
}

export function GameSessionFinishedState() {
  return (
    <section>
      <h1 className="text-[30px] font-bold leading-9 text-[var(--color-brand-ink)]">Игра завершена</h1>
      <p className="mt-4 text-[18px] leading-7 text-[var(--color-brand-graphite)]">
        Ответы сохранены. Если сервер вернет список заданий для просмотра, они появятся на этой странице.
      </p>
    </section>
  );
}

export function QuestionNavigation({ disabled, items, onSelect, variant = "grid" }: QuestionNavigationProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Навигация по заданиям">
      <div
        className={clsx(
          variant === "grid" && "grid grid-cols-5 gap-2 sm:grid-cols-6 lg:grid-cols-5",
          variant === "scroll" && "flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        )}
      >
        {items.map((item) => {
          const itemState = getNavigationItemState(item);

          return (
            <button
              key={item.question_id}
              type="button"
              disabled={disabled}
              aria-current={item.is_current ? "step" : undefined}
              aria-label={`Задание ${item.question_index}${item.answered ? ", отвечено" : ""}`}
              className={clsx(
                "flex h-10 min-w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-[15px] font-normal outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--color-brand-black)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70",
                itemState === "current" && "bg-[var(--color-brand-yellow)] text-[var(--color-brand-ink)] shadow-[0_2px_0_rgba(16,17,20,0.08)]",
                itemState === "skipped" && "bg-[#e7e9ee] text-[var(--color-brand-muted)] hover:bg-[#dde0e6]",
                itemState === "answered" && "bg-[#dff4e8] text-[#159947] hover:bg-[#d3eedf]",
              )}
              onClick={() => onSelect(item)}
            >
              {item.question_index}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function GameSessionSidebar({
  canNavigateQuestions,
  isChangingQuestion,
  navigationError,
  navigationItems,
  progress,
  onSelectQuestion,
}: {
  canNavigateQuestions: boolean;
  isChangingQuestion: boolean;
  navigationError: string | null;
  navigationItems: NavigationItemDTO[];
  progress: StepBasedProgressDTO;
  onSelectQuestion: (item: NavigationItemDTO) => void;
}) {
  return (
    <aside className="hidden space-y-5 lg:block">
      <section className="rounded-[24px] bg-[#f1f3f6] p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-[18px] font-medium leading-6 text-[var(--color-brand-ink)]">Задания</h2>
          {isChangingQuestion && <Loader2 className="h-4 w-4 animate-spin text-[var(--color-brand-muted)]" aria-hidden />}
        </div>
        <QuestionNavigation disabled={!canNavigateQuestions} items={navigationItems} onSelect={onSelectQuestion} />
        {navigationError && <p className="mt-3 text-[14px] leading-5 text-red-600">{navigationError}</p>}
      </section>

      <GameSessionProgressCard progress={progress} />
    </aside>
  );
}

function GameSessionProgressCard({ progress }: { progress: StepBasedProgressDTO }) {
  return (
    <section className="rounded-[20px] bg-[#f1f3f6] p-5">
      <div>
        <p className="text-[14px] leading-5 text-[var(--color-brand-muted)]">Баллы за игру</p>
        <p className="mt-1.5 text-[20px] font-medium leading-7 text-[var(--color-brand-ink)]">
          {progress.current_score} из {progress.max_score}
        </p>
      </div>
      <div className="mt-5">
        <p className="text-[14px] leading-5 text-[var(--color-brand-muted)]">Отвечено</p>
        <p className="mt-1.5 text-[20px] font-medium leading-7 text-[var(--color-brand-ink)]">
          {progress.answered_questions} из {progress.total_questions}
        </p>
      </div>
    </section>
  );
}

export function MobileGameSessionFooter({
  canNavigateQuestions,
  navigationError,
  navigationItems,
  progress,
  onSelectQuestion,
}: {
  canNavigateQuestions: boolean;
  navigationError: string | null;
  navigationItems: NavigationItemDTO[];
  progress: StepBasedProgressDTO;
  onSelectQuestion: (item: NavigationItemDTO) => void;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--color-brand-line)] bg-white/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-10px_30px_rgba(16,17,20,0.08)] backdrop-blur lg:hidden">
      <div className="mx-auto max-w-[720px]">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-[12px] leading-4 text-[var(--color-brand-muted)]">Баллы</p>
            <p className="text-[16px] font-medium leading-5 text-[var(--color-brand-ink)]">
              {progress.current_score} из {progress.max_score}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[12px] leading-4 text-[var(--color-brand-muted)]">Отвечено</p>
            <p className="text-[16px] font-medium leading-5 text-[var(--color-brand-ink)]">
              {progress.answered_questions} из {progress.total_questions}
            </p>
          </div>
        </div>

        <QuestionNavigation disabled={!canNavigateQuestions} items={navigationItems} onSelect={onSelectQuestion} variant="scroll" />
        {navigationError && <p className="mt-2 text-[13px] leading-5 text-red-600">{navigationError}</p>}
      </div>
    </div>
  );
}
