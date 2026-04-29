import type { Metadata } from "next";
import DirectionDetailsClient from "./DirectionDetailsClient";

export const metadata: Metadata = {
  title: "Направление - T-Events",
  description: "Описание направления и переход к играм мероприятия T-Events.",
};

export default function DirectionDetailsPage() {
  return <DirectionDetailsClient />;
}
