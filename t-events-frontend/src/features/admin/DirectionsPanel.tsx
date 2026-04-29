import type { FormEvent } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ErrorMessage from "@/components/ui/ErrorMessage";
import Select from "@/components/ui/Select";
import Typography from "@/components/ui/Typography";
import type { AdminEventDirectionDTO, DirectionDTO } from "@/lib/api/types";
import { getErrorMessage } from "@/lib/getErrorMessage";

type DirectionsPanelProps = {
  availableDirections: DirectionDTO[];
  eventDirections: AdminEventDirectionDTO[];
  directionId: string;
  removeDirectionId: string;
  isDraft: boolean;
  isCatalogLoading: boolean;
  isAddPending: boolean;
  isRemovePending: boolean;
  catalogError: unknown;
  mutationError: unknown;
  onDirectionChange: (value: string) => void;
  onRemoveDirectionChange: (value: string) => void;
  onAddDirection: (event: FormEvent<HTMLFormElement>) => void;
  onRemoveDirection: (event: FormEvent<HTMLFormElement>) => void;
};

export default function DirectionsPanel({
  availableDirections,
  eventDirections,
  directionId,
  removeDirectionId,
  isDraft,
  isCatalogLoading,
  isAddPending,
  isRemovePending,
  catalogError,
  mutationError,
  onDirectionChange,
  onRemoveDirectionChange,
  onAddDirection,
  onRemoveDirection,
}: DirectionsPanelProps) {
  return (
    <Card className="border-0" id="settings-panel-directions" role="tabpanel" aria-labelledby="settings-tab-directions">
      <Typography as="h2" size="lg" weight="bold">
        Направления
      </Typography>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={onAddDirection}>
          <Select
            label="Добавить направление"
            value={directionId}
            onChange={(event) => onDirectionChange(event.target.value)}
            required
          >
            <option value="">Выберите направление</option>
            {availableDirections.map((direction) => (
              <option key={direction.direction_id} value={direction.direction_id}>
                {direction.name}
              </option>
            ))}
          </Select>
          <Button type="submit" disabled={!isDraft || isAddPending}>
            {isAddPending ? "Добавление..." : "Добавить"}
          </Button>
        </form>

        <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={onRemoveDirection}>
          <Select
            label="Удалить направление"
            value={removeDirectionId}
            onChange={(event) => onRemoveDirectionChange(event.target.value)}
            required
          >
            <option value="">Выберите направление</option>
            {eventDirections.map((direction) => (
              <option key={direction.direction_id} value={direction.direction_id}>
                {direction.name}
              </option>
            ))}
          </Select>
          <Button type="submit" variant="secondary" disabled={!isDraft || isRemovePending}>
            {isRemovePending ? "Удаление..." : "Удалить"}
          </Button>
        </form>
      </div>

      {isCatalogLoading && (
        <Typography className="mt-3 text-neutral-600" size="sm">
          Ищем направления...
        </Typography>
      )}

      {!isCatalogLoading && availableDirections.length === 0 && (
        <Typography className="mt-3 text-neutral-600" size="sm">
          Все доступные направления уже добавлены или каталог пуст.
        </Typography>
      )}

      {Boolean(catalogError) && (
        <ErrorMessage className="mt-3" message={getErrorMessage(catalogError, "Не удалось загрузить каталог направлений")} />
      )}

      {eventDirections.length === 0 && (
        <Typography className="mt-3 text-neutral-600" size="sm">
          У мероприятия пока нет привязанных направлений.
        </Typography>
      )}

      {Boolean(mutationError) && (
        <ErrorMessage className="mt-3" message={getErrorMessage(mutationError, "Не удалось изменить направления")} />
      )}
    </Card>
  );
}
