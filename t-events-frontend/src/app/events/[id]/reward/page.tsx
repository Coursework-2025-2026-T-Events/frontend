import type { Metadata } from "next";
import RewardClient from "./RewardClient";

export const metadata: Metadata = {
  title: "Получение приза - T-Events",
  description: "Проверка доступности приза и QR-код для получения мерча T-Events.",
};

export default function RewardPage() {
  return <RewardClient />;
}
