"use client";

import { useRef, type KeyboardEvent } from "react";
import Container from "@/components/ui/Container";
import RequireAuth from "@/features/auth/RequireAuth";
import { isFinishedSession } from "@/features/events/gameSession";
import {
  GameSessionBackLink,
  GameSessionFinishedState,
  GameSessionInitialError,
  GameSessionInitialLoading,
  GameSessionQuestionPanel,
  GameSessionQuestionSkeleton,
  GameSessionSidebar,
  MobileGameSessionFooter,
} from "@/features/events/GameSessionViews";
import { getQuizKeyboardAction } from "@/features/events/quizKeyboard";
import { useGameSessionPage } from "@/features/events/useGameSessionPage";
import type { QuizQuestionOptionDTO } from "@/lib/api/types";

export default function GameSessionClient() {
  const session = useGameSessionPage();
  const quizOptionRefs = useRef<Record<number, HTMLButtonElement | null>>({});

  const focusQuizOption = (options: QuizQuestionOptionDTO[], index: number) => {
    const option = options[index];
    if (!option) return;
    session.setSelectedOptionId(option.option_id);
    quizOptionRefs.current[option.option_id]?.focus();
  };

  const handleQuizKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    options: QuizQuestionOptionDTO[],
    index: number,
  ) => {
    const action = getQuizKeyboardAction(event.key, index, options.length);

    if (action.type === "select") {
      event.preventDefault();
      const option = options[index];
      if (option) session.setSelectedOptionId(option.option_id);
      return;
    }

    if (action.type === "move") {
      event.preventDefault();
      focusQuizOption(options, action.nextIndex);
    }
  };

  return (
    <RequireAuth>
      <div className="min-h-[calc(100vh-4rem)] bg-white pb-[calc(10rem+env(safe-area-inset-bottom))] lg:pb-12">
        <Container>
          <div className="py-4 sm:py-8">
            <GameSessionBackLink directionId={session.directionId} eventId={session.eventId} />

            {session.isLoadingInitialState && <GameSessionInitialLoading />}
            {session.initialError && <GameSessionInitialError error={session.initialError} />}

            {session.state && (
              <div className="mt-7 grid gap-7 sm:mt-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
                <main>
                  {session.state.status === "active" && !session.currentQuestion && <GameSessionQuestionSkeleton />}

                  {session.canNavigateQuestions && session.currentQuestion && (
                    <GameSessionQuestionPanel
                      answerResultLabel={session.answerResultLabel}
                      canNavigateQuestions={session.canNavigateQuestions}
                      canSubmit={session.canSubmit}
                      currentQuestion={session.currentQuestion}
                      currentQuestionNumber={session.currentQuestionNumber}
                      displayedAnswerText={session.displayedAnswerText}
                      displayedSelectedOptionId={session.displayedSelectedOptionId}
                      isAnsweredQuestion={session.isAnsweredQuestion}
                      isCorrectAnsweredQuestion={session.isCorrectAnsweredQuestion}
                      isReviewMode={session.isReviewMode}
                      isSelectQuestionPending={session.selectQuestionMutation.isPending}
                      isSubmitPending={session.submitAnswerMutation.isPending}
                      isWrongAnsweredQuestion={session.isWrongAnsweredQuestion}
                      nextNavigationItem={session.nextNavigationItem}
                      quizOptionRefs={quizOptionRefs}
                      submitError={session.submitAnswerMutation.error}
                      onAnswerTextChange={session.setAnswerText}
                      onNextQuestion={session.handleQuestionSelect}
                      onQuizKeyDown={handleQuizKeyDown}
                      onSelectOption={session.setSelectedOptionId}
                      onSubmit={session.handleSubmit}
                    />
                  )}

                  {isFinishedSession(session.state.status) && !session.currentQuestion && <GameSessionFinishedState />}
                </main>

                <GameSessionSidebar
                  canNavigateQuestions={session.canNavigateQuestions}
                  isChangingQuestion={session.selectQuestionMutation.isPending}
                  navigationError={session.navigationError}
                  navigationItems={session.navigationItems}
                  progress={session.state.progress}
                  onSelectQuestion={session.handleQuestionSelect}
                />
              </div>
            )}
          </div>
        </Container>

        {session.state && (
          <MobileGameSessionFooter
            canNavigateQuestions={session.canNavigateQuestions}
            navigationError={session.navigationError}
            navigationItems={session.navigationItems}
            progress={session.state.progress}
            onSelectQuestion={session.handleQuestionSelect}
          />
        )}
      </div>
    </RequireAuth>
  );
}
