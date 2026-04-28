export const quizNavigationKeys = ["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"] as const;
export const quizSelectionKeys = [" ", "Enter"] as const;

export type QuizKeyboardAction =
  | { type: "move"; nextIndex: number }
  | { type: "select" }
  | { type: "ignore" };

export function getQuizKeyboardAction(key: string, currentIndex: number, optionCount: number): QuizKeyboardAction {
  if (optionCount <= 0 || currentIndex < 0 || currentIndex >= optionCount) return { type: "ignore" };
  if ((quizSelectionKeys as readonly string[]).includes(key)) return { type: "select" };

  const lastIndex = optionCount - 1;
  if (key === "ArrowDown" || key === "ArrowRight") {
    return { type: "move", nextIndex: currentIndex === lastIndex ? 0 : currentIndex + 1 };
  }
  if (key === "ArrowUp" || key === "ArrowLeft") {
    return { type: "move", nextIndex: currentIndex === 0 ? lastIndex : currentIndex - 1 };
  }
  if (key === "Home") return { type: "move", nextIndex: 0 };
  if (key === "End") return { type: "move", nextIndex: lastIndex };

  return { type: "ignore" };
}
