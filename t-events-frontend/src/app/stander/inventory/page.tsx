"use client";

import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import Typography from "@/components/ui/Typography";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import RequireAuth from "@/features/auth/RequireAuth";

export default function StanderInventoryPage() {
  // TODO: заменить на реальные данные из inventory API
  type ItemStatus = "available" | "low" | "out";
  
  const items: { name: string; status: ItemStatus }[] = [
    { name: "Малый приз", status: "available" },
    { name: "Большой приз", status: "low" },
  ];

  return (
    <RequireAuth allowedRoles={["stander", "admin"]}>
      <Container>
        <div className="mt-8">
          <Typography as="h1" size="xl" weight="bold">
            Статус мерча
          </Typography>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {items.map((item) => (
              <Card key={item.name}>
                <Typography as="h2" size="lg" weight="bold">
                  {item.name}
                </Typography>

                <div className="mt-2">
                  {item.status === "available" && <Badge variant="success">В наличии</Badge>}
                  {item.status === "low" && <Badge variant="warning">Почти закончился</Badge>}
                  {item.status === "out" && <Badge variant="danger">Закончился</Badge>}
                </div>

                <div className="mt-4 flex gap-2">
                  <Button variant="secondary">В наличии</Button>
                  <Button variant="secondary">Почти закончился</Button>
                  <Button variant="secondary">Закончился</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Container>
    </RequireAuth>
  );
}
