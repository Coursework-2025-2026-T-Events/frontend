import type { Metadata } from "next";
import DirectionsClient from "./DirectionsClient";

export const metadata: Metadata = {
  title: "Направления мероприятия - T-Events",
  description: "Выбор направления мероприятия для участия в T-Events.",
};

export default function DirectionsPage() {
  return <DirectionsClient />;
}
