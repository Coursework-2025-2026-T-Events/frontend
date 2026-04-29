import type { Metadata } from "next";
import StanderInventoryClient from "./StanderInventoryClient";

export const metadata: Metadata = {
  title: "Журнал выдачи - T-Events",
  description: "История выданных призов и фильтры стойки выдачи T-Events.",
};

export default function StanderInventoryPage() {
  return <StanderInventoryClient />;
}
