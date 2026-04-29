import type { Metadata } from "next";
import StanderScanClient from "./StanderScanClient";

export const metadata: Metadata = {
  title: "Сканирование QR - T-Events",
  description: "Проверка QR-кодов и подтверждение выдачи призов на стойке T-Events.",
};

export default function StanderScanPage() {
  return <StanderScanClient />;
}
