import type { Metadata } from "next";
import EventDetailsClient from "./EventDetailsClient";

export const metadata: Metadata = {
  title: "Мероприятие - T-Events",
  description: "Описание мероприятия, направления и переход к участию в T-Events.",
};

export default function EventDetailsPage() {
  return <EventDetailsClient />;
}
