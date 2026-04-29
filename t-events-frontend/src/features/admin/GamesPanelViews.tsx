import type { FormEvent } from "react";
import clsx from "clsx";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ErrorMessage from "@/components/ui/ErrorMessage";
import Select from "@/components/ui/Select";
import Typography from "@/components/ui/Typography";
import type { AdminEventDirectionDTO, AdminEventGameDTO, GameEngine, GameTemplateDTO } from "@/lib/api/types";
import { getErrorMessage } from "@/lib/getErrorMessage";
import ConfigInputs from "./ConfigInputs";
import type { AdminGameConfigForm } from "./gameConfig";
import type { GamesByDirection } from "./games";
import { engineLabels } from "./labels";

export function AttachGameForm({
  attachDirectionId,
  attachError,
  configForm,
  eventDirections,
  isAttachPending,
  isDraft,
  onAttach,
  onAttachDirectionChange,
  onConfigFormChange,
  onSelectedTemplateChange,
  onTemplateEngineChange,
  selectedTemplate,
  selectedTemplateId,
  templateEngine,
  templates,
}: {
  attachDirectionId: string;
  attachError: unknown;
  configForm: AdminGameConfigForm;
  eventDirections: AdminEventDirectionDTO[];
  isAttachPending: boolean;
  isDraft: boolean;
  onAttach: (event: FormEvent<HTMLFormElement>) => void;
  onAttachDirectionChange: (value: string) => void;
  onConfigFormChange: (value: AdminGameConfigForm) => void;
  onSelectedTemplateChange: (value: string) => void;
  onTemplateEngineChange: (value: GameEngine | "all") => void;
  selectedTemplate?: GameTemplateDTO | undefined;
  selectedTemplateId: string;
  templateEngine: GameEngine | "all";
  templates: GameTemplateDTO[];
}) {
  return (
    <Card className="border-0" id="settings-panel-games" role="tabpanel" aria-labelledby="settings-tab-games">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Typography as="h2" size="lg" weight="bold">
          Игры
        </Typography>
        <Select
          aria-label="Тип шаблона"
          className="w-full sm:w-auto"
          value={templateEngine}
          onChange={(event) => onTemplateEngineChange(event.target.value as GameEngine | "all")}
        >
          <option value="all">{engineLabels.all}</option>
          <option value="quiz">{engineLabels.quiz}</option>
          <option value="question_answer">{engineLabels.question_answer}</option>
        </Select>
      </div>
      <Typography className="mt-1 text-[var(--color-brand-graphite)]" size="sm">
        Выберите направление, шаблон и правила начисления баллов.
      </Typography>

      <form className="mt-4 space-y-4" onSubmit={onAttach}>
        <div className="grid gap-4 md:grid-cols-2">
          <Select label="Направление" value={attachDirectionId} onChange={(event) => onAttachDirectionChange(event.target.value)} required>
            <option value="">Выберите направление</option>
            {eventDirections.map((direction) => (
              <option key={direction.direction_id} value={direction.direction_id}>
                {direction.name}
              </option>
            ))}
          </Select>
          <Select label="Шаблон игры" value={selectedTemplateId} onChange={(event) => onSelectedTemplateChange(event.target.value)} required>
            <option value="">Выберите шаблон</option>
            {templates.map((template) => (
              <option key={template.game_template_id} value={template.game_template_id}>
                {template.title} ({engineLabels[template.engine]})
              </option>
            ))}
          </Select>
        </div>

        {selectedTemplate && (
          <div className="rounded-[var(--radius-md)] bg-[var(--color-brand-panel)] p-3">
            <Typography className="text-[var(--color-brand-graphite)]" size="sm">
              {selectedTemplate.description}
            </Typography>
            <Typography className="mt-2 text-neutral-600" size="sm">
              В шаблоне: легкие {selectedTemplate.question_stats.easy}, средние {selectedTemplate.question_stats.medium}, сложные{" "}
              {selectedTemplate.question_stats.hard}, всего {selectedTemplate.question_stats.total}
            </Typography>
          </div>
        )}

        <ConfigInputs form={configForm} setForm={onConfigFormChange} questionStats={selectedTemplate?.question_stats} disabled={!isDraft} />

        <Button type="submit" disabled={!isDraft || isAttachPending || !selectedTemplateId}>
          {isAttachPending ? "Добавление..." : "Добавить"}
        </Button>
      </form>
      {Boolean(attachError) && <ErrorMessage className="mt-3" message={getErrorMessage(attachError, "Не удалось добавить игру")} />}
    </Card>
  );
}

export function EventGamesList({
  deleteError,
  editingGame,
  editingGameTemplate,
  eventGames,
  gamesByDirection,
  gamesWithoutDirection,
  isDeletePending,
  isDraft,
  isUpdatePending,
  onCancelEdit,
  onDeleteGame,
  onEditGame,
  onUpdateConfigFormChange,
  onUpdateGame,
  updateConfigForm,
  updateError,
  updateEventGameId,
}: {
  deleteError: unknown;
  editingGame: AdminEventGameDTO | null;
  editingGameTemplate?: GameTemplateDTO | undefined;
  eventGames: AdminEventGameDTO[];
  gamesByDirection: GamesByDirection[];
  gamesWithoutDirection: AdminEventGameDTO[];
  isDeletePending: boolean;
  isDraft: boolean;
  isUpdatePending: boolean;
  onCancelEdit: () => void;
  onDeleteGame: (game: AdminEventGameDTO) => void;
  onEditGame: (game: AdminEventGameDTO) => void;
  onUpdateConfigFormChange: (value: AdminGameConfigForm) => void;
  onUpdateGame: (event: FormEvent<HTMLFormElement>) => void;
  updateConfigForm: AdminGameConfigForm;
  updateError: unknown;
  updateEventGameId: string;
}) {
  const renderEventGame = (game: AdminEventGameDTO) => (
    <EventGameCard
      key={game.event_game_id}
      game={game}
      isDraft={isDraft}
      isDeletePending={isDeletePending}
      isEditing={editingGame?.event_game_id === game.event_game_id}
      editingGameTemplate={editingGameTemplate}
      updateEventGameId={updateEventGameId}
      updateConfigForm={updateConfigForm}
      isUpdatePending={isUpdatePending}
      updateError={updateError}
      onUpdateConfigFormChange={onUpdateConfigFormChange}
      onUpdateGame={onUpdateGame}
      onEditGame={onEditGame}
      onDeleteGame={onDeleteGame}
      onCancelEdit={onCancelEdit}
    />
  );

  return (
    <Card className="border-0">
      <Typography as="h2" size="lg" weight="bold">
        Добавленные игры
      </Typography>
      {eventGames.length === 0 ? (
        <Typography className="mt-3 text-neutral-600" size="sm">
          В мероприятии пока нет игр.
        </Typography>
      ) : (
        <div className="mt-4 grid gap-5">
          {gamesByDirection.map(({ direction, games }) => (
            <section key={direction.direction_id} className="border-t border-[var(--color-brand-line)] pt-4 first:border-t-0 first:pt-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Typography weight="bold">{direction.name}</Typography>
                <span className="rounded-full bg-[var(--color-brand-panel)] px-3 py-1 text-[13px] text-[var(--color-brand-muted)]">
                  Игр: {games.length}
                </span>
              </div>
              {games.length === 0 ? (
                <Typography className="mt-3 text-neutral-600" size="sm">
                  В этом направлении пока нет игр.
                </Typography>
              ) : (
                <div className="mt-3 grid gap-3">{games.map(renderEventGame)}</div>
              )}
            </section>
          ))}
          {gamesWithoutDirection.length > 0 && (
            <section className="border-t border-[var(--color-brand-line)] pt-4">
              <Typography weight="bold">Без привязанного направления</Typography>
              <div className="mt-3 grid gap-3">{gamesWithoutDirection.map(renderEventGame)}</div>
            </section>
          )}
        </div>
      )}
      {Boolean(deleteError) && <ErrorMessage className="mt-3" message={getErrorMessage(deleteError, "Не удалось удалить игру")} />}
    </Card>
  );
}

type EventGameCardProps = {
  game: AdminEventGameDTO;
  isDraft: boolean;
  isDeletePending: boolean;
  isEditing: boolean;
  editingGameTemplate?: GameTemplateDTO | undefined;
  updateEventGameId: string;
  updateConfigForm: AdminGameConfigForm;
  isUpdatePending: boolean;
  updateError: unknown;
  onUpdateConfigFormChange: (value: AdminGameConfigForm) => void;
  onUpdateGame: (event: FormEvent<HTMLFormElement>) => void;
  onEditGame: (game: AdminEventGameDTO) => void;
  onDeleteGame: (game: AdminEventGameDTO) => void;
  onCancelEdit: () => void;
};

function EventGameCard({
  game,
  isDraft,
  isDeletePending,
  isEditing,
  editingGameTemplate,
  updateEventGameId,
  updateConfigForm,
  isUpdatePending,
  updateError,
  onUpdateConfigFormChange,
  onUpdateGame,
  onEditGame,
  onDeleteGame,
  onCancelEdit,
}: EventGameCardProps) {
  return (
    <div
      className={clsx(
        "rounded-[var(--radius-md)] border bg-white p-4",
        isEditing ? "border-[var(--color-brand-ink)] shadow-[0_10px_28px_rgba(16,17,20,0.10)]" : "border-[var(--color-brand-line)]",
      )}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <Typography weight="bold">{game.title}</Typography>
          <Typography className="mt-1 text-neutral-600" size="sm">
            {game.direction_name} · {game.template_title} · {engineLabels[game.engine]}
          </Typography>
          <Typography className="mt-1 text-neutral-600" size="sm">
            Максимум: {game.max_score}. Шагов: {game.steps_total}.
          </Typography>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" disabled={!isDraft} onClick={() => onEditGame(game)}>
            Изменить
          </Button>
          <Button type="button" variant="ghost" disabled={!isDraft || isDeletePending} onClick={() => onDeleteGame(game)}>
            Удалить
          </Button>
        </div>
      </div>

      {isEditing && (
        <form className="mt-4 border-t border-[var(--color-brand-line)] pt-4" onSubmit={onUpdateGame}>
          <ConfigInputs
            form={updateConfigForm}
            setForm={onUpdateConfigFormChange}
            questionStats={editingGameTemplate?.question_stats}
            disabled={!isDraft}
          />
          <div className="mt-4 flex flex-wrap gap-3">
            <Button type="submit" disabled={!isDraft || !updateEventGameId || isUpdatePending}>
              {isUpdatePending ? "Сохранение..." : "Сохранить правила"}
            </Button>
            <Button type="button" variant="ghost" onClick={onCancelEdit}>
              Отменить
            </Button>
          </div>
          {Boolean(updateError) && (
            <ErrorMessage className="mt-3" message={getErrorMessage(updateError, "Не удалось обновить правила игры")} />
          )}
        </form>
      )}
    </div>
  );
}
