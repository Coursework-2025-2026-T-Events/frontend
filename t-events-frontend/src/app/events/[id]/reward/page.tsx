"use client";

import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import Typography from "@/components/ui/Typography";
import Button from "@/components/ui/Button";
import RequireAuth from "@/features/auth/RequireAuth";

export default function RewardPage() {
  // TODO: заменить заглушки реальными данными (баллы, статус приза, QR)
  const hasReward = false; // заглушка
  const rewardType = "small"; // "small" | "big" (заглушка)

  return (
    <RequireAuth>
      <Container>
        <div className="mt-8">
          <Typography as="h1" size="xl" weight="bold">
            Приз
          </Typography>

          <Card className="mt-6">
            <Typography as="h2" size="lg" weight="bold">
              Ваш статус
            </Typography>
            <Typography className="mt-2 text-neutral-600" size="sm">
              {hasReward
                ? `Приз уже получен (${rewardType === "small" ? "малый" : "большой"})`
                : "Приз ещё не доступен"}
            </Typography>

            {!hasReward && (
              <Button className="mt-4">
                Получить приз (QR)
              </Button>
            )}

            {hasReward && (
              <Typography className="mt-4 text-neutral-600" size="sm">
                Выдача повторного приза невозможна.
              </Typography>
            )}
          </Card>

          {/* QR код — заглушка */}
          {!hasReward && (
            <Card className="mt-6 flex flex-col items-center justify-center">
              <div className="h-40 w-40 rounded bg-neutral-200" />
              <Typography className="mt-3 text-neutral-600" size="sm">
                Здесь будет QR‑код
              </Typography>
            </Card>
          )}
        </div>
      </Container>
    </RequireAuth>
  );
}