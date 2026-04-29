import type { Metadata } from "next";
import EventsClient from "./EventsClient";

export const metadata: Metadata = {
  title: "Мероприятия - T-Events",
  description: "Каталог мероприятий T-Events для выбора направления, прохождения игр и получения наград.",
};

export default function EventsPage() {
  return <EventsClient />;
}
