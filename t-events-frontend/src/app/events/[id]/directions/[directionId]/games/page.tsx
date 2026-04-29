import type { Metadata } from "next";
import DirectionGamesClient from "./DirectionGamesClient";

export const metadata: Metadata = {
  title: "Игры направления - T-Events",
  description: "Список игр и прогресс по выбранному направлению мероприятия T-Events.",
};

export default function DirectionGamesPage() {
  return <DirectionGamesClient />;
}
