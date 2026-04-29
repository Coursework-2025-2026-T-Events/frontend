import type { Metadata } from "next";
import AdminEventDetailClient from "./AdminEventDetailClient";

export const metadata: Metadata = {
  title: "Настройка мероприятия - T-Events",
  description: "Административная настройка мероприятия, направлений, игр и публикации в T-Events.",
};

export default function AdminEventDetailPage() {
  return <AdminEventDetailClient />;
}
