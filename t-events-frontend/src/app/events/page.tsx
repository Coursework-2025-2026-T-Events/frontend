"use client";

import { useQuery } from "@tanstack/react-query";
import Container from "@/components/ui/Container";
import { eventsApi } from "@/features/events/api";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Typography from "@/components/ui/Typography";

export default function EventsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["events"],
    queryFn: eventsApi.list,
  });

  return (
    <Container>
      <div className="mt-8">
        <Typography as="h1" size="xl" weight="bold">
          Активные мероприятия
        </Typography>

        {isLoading && <p className="mt-4">Загрузка...</p>}
        {error && <p className="mt-4 text-red-600">Ошибка загрузки</p>}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data?.data.map((event) => (
            <Link key={event.event_id} href={`/events/${event.event_id}`}>
              <Card className="hover:shadow-md transition">
                <Typography as="h2" size="lg" weight="bold">
                  {event.title}
                </Typography>
                <Typography className="mt-2 text-neutral-600" size="sm">
                  {event.description}
                </Typography>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </Container>
  );
}