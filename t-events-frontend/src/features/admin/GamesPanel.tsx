import type { FormEvent } from "react";
import type { AdminEventDirectionDTO, AdminEventGameDTO, GameEngine, GameTemplateDTO } from "@/lib/api/types";
import type { AdminGameConfigForm } from "./gameConfig";
import type { GamesByDirection } from "./games";
import { AttachGameForm, EventGamesList } from "./GamesPanelViews";

type GamesPanelProps = {
  isDraft: boolean;
  eventDirections: AdminEventDirectionDTO[];
  eventGames: AdminEventGameDTO[];
  gamesByDirection: GamesByDirection[];
  gamesWithoutDirection: AdminEventGameDTO[];
  templates: GameTemplateDTO[];
  templateEngine: GameEngine | "all";
  attachDirectionId: string;
  selectedTemplateId: string;
  selectedTemplate?: GameTemplateDTO | undefined;
  configForm: AdminGameConfigForm;
  editingGame: AdminEventGameDTO | null;
  editingGameTemplate?: GameTemplateDTO | undefined;
  updateEventGameId: string;
  updateConfigForm: AdminGameConfigForm;
  isAttachPending: boolean;
  isUpdatePending: boolean;
  isDeletePending: boolean;
  attachError: unknown;
  updateError: unknown;
  deleteError: unknown;
  onTemplateEngineChange: (value: GameEngine | "all") => void;
  onAttachDirectionChange: (value: string) => void;
  onSelectedTemplateChange: (value: string) => void;
  onConfigFormChange: (value: AdminGameConfigForm) => void;
  onUpdateConfigFormChange: (value: AdminGameConfigForm) => void;
  onAttach: (event: FormEvent<HTMLFormElement>) => void;
  onUpdateGame: (event: FormEvent<HTMLFormElement>) => void;
  onEditGame: (game: AdminEventGameDTO) => void;
  onDeleteGame: (game: AdminEventGameDTO) => void;
  onCancelEdit: () => void;
};

export default function GamesPanel({
  isDraft,
  eventDirections,
  eventGames,
  gamesByDirection,
  gamesWithoutDirection,
  templates,
  templateEngine,
  attachDirectionId,
  selectedTemplateId,
  selectedTemplate,
  configForm,
  editingGame,
  editingGameTemplate,
  updateEventGameId,
  updateConfigForm,
  isAttachPending,
  isUpdatePending,
  isDeletePending,
  attachError,
  updateError,
  deleteError,
  onTemplateEngineChange,
  onAttachDirectionChange,
  onSelectedTemplateChange,
  onConfigFormChange,
  onUpdateConfigFormChange,
  onAttach,
  onUpdateGame,
  onEditGame,
  onDeleteGame,
  onCancelEdit,
}: GamesPanelProps) {
  return (
    <>
      <AttachGameForm
        attachDirectionId={attachDirectionId}
        attachError={attachError}
        configForm={configForm}
        eventDirections={eventDirections}
        isAttachPending={isAttachPending}
        isDraft={isDraft}
        onAttach={onAttach}
        onAttachDirectionChange={onAttachDirectionChange}
        onConfigFormChange={onConfigFormChange}
        onSelectedTemplateChange={onSelectedTemplateChange}
        onTemplateEngineChange={onTemplateEngineChange}
        selectedTemplate={selectedTemplate}
        selectedTemplateId={selectedTemplateId}
        templateEngine={templateEngine}
        templates={templates}
      />

      <EventGamesList
        deleteError={deleteError}
        editingGame={editingGame}
        editingGameTemplate={editingGameTemplate}
        eventGames={eventGames}
        gamesByDirection={gamesByDirection}
        gamesWithoutDirection={gamesWithoutDirection}
        isDeletePending={isDeletePending}
        isDraft={isDraft}
        isUpdatePending={isUpdatePending}
        onCancelEdit={onCancelEdit}
        onDeleteGame={onDeleteGame}
        onEditGame={onEditGame}
        onUpdateConfigFormChange={onUpdateConfigFormChange}
        onUpdateGame={onUpdateGame}
        updateConfigForm={updateConfigForm}
        updateError={updateError}
        updateEventGameId={updateEventGameId}
      />
    </>
  );
}
