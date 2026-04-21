"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Container from "@/components/ui/Container";
import { eventsApi } from "@/features/events/api";
import Link from "next/link";

export default function EventDetailsPage() {
  const params = useParams();
  const id = Number(params.id);

  const { data, isLoading, error } = useQuery({
    queryKey: ["event", id],
    queryFn: () => eventsApi.getById(id),
    enabled: Number.isFinite(id),
  });

  if (isLoading) return <Container><p className="mt-6">Загрузка...</p></Container>;
  if (error || !data) return <Container><p className="mt-6 text-red-600">Ошибка</p></Container>;

  const event = data.data;

  return (
    <Container>
      <div className="mt-8">
        <h1 className="text-2xl font-bold">{event.title}</h1>
        <p className="mt-2 text-sm text-neutral-600">{event.description}</p>

        <Link
          className="mt-6 inline-block rounded-[var(--radius-md)] border px-4 py-2 text-sm"
          href={`/events/${event.event_id}/directions`}
        >
          Выбрать направление
        </Link>
      </div>
    </Container>
  );
}