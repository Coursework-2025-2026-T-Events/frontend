import type { Metadata } from "next";
import GameSessionClient from "./GameSessionClient";

export const metadata: Metadata = {
  title: "Игровая сессия - T-Events",
  description: "Прохождение задания мероприятия T-Events.",
};

export default function GameSessionPage() {
  return <GameSessionClient />;
}
