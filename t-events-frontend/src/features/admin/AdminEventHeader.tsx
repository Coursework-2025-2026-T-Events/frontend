import Button from "@/components/ui/Button";
import Typography from "@/components/ui/Typography";
import { statusLabels } from "./labels";

type Props = {
  eventId: number;
  status?: string;
  directionCount?: number;
  gameCount?: number;
  onBack?: () => void;
};

export default function AdminEventHeader({ eventId, status, directionCount, gameCount, onBack }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <Typography as="h1" size="xl" weight="bold">
          Мероприятие #{eventId}
        </Typography>
        {status && directionCount !== undefined && gameCount !== undefined && (
          <Typography className="mt-1 text-neutral-600" size="sm">
            {statusLabels[status] ?? "неизвестный статус"} · направлений: {directionCount} · игр: {gameCount}
          </Typography>
        )}
      </div>
      <Button type="button" onClick={onBack} variant="secondary">
        К мероприятиям
      </Button>
    </div>
  );
}
