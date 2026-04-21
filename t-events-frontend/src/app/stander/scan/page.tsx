"use client";

import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import Typography from "@/components/ui/Typography";
import Button from "@/components/ui/Button";
import RequireAuth from "@/features/auth/RequireAuth";

export default function StanderScanPage() {
  return (
    <RequireAuth allowedRoles={["stander", "admin"]}>
      <Container>
        <div className="mt-8">
          <Typography as="h1" size="xl" weight="bold">
            Сканирование QR
          </Typography>

          <Card className="mt-6">
            <Typography as="h2" size="lg" weight="bold">
              Сканер
            </Typography>
            <Typography className="mt-2 text-neutral-600" size="sm">
              Здесь будет камера / ввод кода вручную
            </Typography>

            <Button className="mt-4">Проверить QR</Button>
          </Card>

          <Card className="mt-6">
            <Typography as="h2" size="lg" weight="bold">
              Результат проверки
            </Typography>
            <Typography className="mt-2 text-neutral-600" size="sm">
              Статус: — (заглушка)
            </Typography>
          </Card>
        </div>
      </Container>
    </RequireAuth>
  );
}
