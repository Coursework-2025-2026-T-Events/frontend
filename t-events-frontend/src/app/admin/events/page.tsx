import type { Metadata } from "next";
import AdminEventsClient from "./AdminEventsClient";

export const metadata: Metadata = {
  title: "Администрирование мероприятий - T-Events",
  description: "Создание, поиск и настройка мероприятий T-Events для администратора.",
};

export default function AdminEventsPage() {
  return <AdminEventsClient />;
}
