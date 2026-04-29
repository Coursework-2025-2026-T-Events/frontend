import type { Metadata } from "next";
import DirectionProgressClient from "./DirectionProgressClient";

export const metadata: Metadata = {
  title: "Рейтинг направления - T-Events",
  description: "Рейтинг участников и прогресс по выбранному направлению мероприятия T-Events.",
};

export default function DirectionProgressPage() {
  return <DirectionProgressClient />;
}
