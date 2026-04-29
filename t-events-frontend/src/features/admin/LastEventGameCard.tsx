import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Typography from "@/components/ui/Typography";
import type { AdminEventGameDTO } from "@/lib/api/types";

type Props = {
  game: AdminEventGameDTO;
  canEdit?: boolean;
  onEdit?: () => void;
};

export default function LastEventGameCard({ game, canEdit = false, onEdit }: Props) {
  return (
    <Card>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Typography as="h2" size="lg" weight="bold">
            Игра добавлена
          </Typography>
          <Typography className="mt-2 text-neutral-700" size="sm">
            {game.title}. Максимум баллов: {game.max_score}. Шагов: {game.steps_total}.
          </Typography>
        </div>
        {onEdit && (
          <Button type="button" variant="secondary" onClick={onEdit} disabled={!canEdit}>
            Изменить правила
          </Button>
        )}
      </div>
    </Card>
  );
}
