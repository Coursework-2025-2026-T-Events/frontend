import Card from "@/components/ui/Card";
import Typography from "@/components/ui/Typography";
import type { AdminEventGameDTO } from "@/lib/api/types";

type Props = {
  game: AdminEventGameDTO;
};

export default function LastEventGameCard({ game }: Props) {
  return (
    <Card>
      <Typography as="h2" size="lg" weight="bold">
        Последняя измененная игра
      </Typography>
      <Typography className="mt-2 text-neutral-700" size="sm">
        #{game.event_game_id} {game.title} | направление #{game.direction_id} | максимум баллов {game.max_score} |
        шагов {game.steps_total}
      </Typography>
    </Card>
  );
}
