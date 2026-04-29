import type { Dispatch, FormEvent, SetStateAction } from "react";
import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { adminApi } from "./api";
import type { ConfirmDialogState } from "./ConfirmationDialog";
import {
  configToForm,
  defaultConfigForm,
  getTemplateDefaultConfigForm,
  toConfig,
  validateConfigForm,
} from "./gameConfig";
import type { AdminEventGameDTO, GameEngine, GameTemplateDTO } from "@/lib/api/types";

type UseAdminEventGamesInput = {
  eventId: number;
  templateEngine: GameEngine | "all";
  templates: GameTemplateDTO[];
  invalidateEvent: () => void;
  setClientError: (message: string | null) => void;
  setTemplateEngine: Dispatch<SetStateAction<GameEngine | "all">>;
  setLastSavedAt: (value: Date) => void;
  setConfirmDialog: (state: ConfirmDialogState) => void;
};

export function useAdminEventGames({
  eventId,
  templateEngine,
  templates,
  invalidateEvent,
  setClientError,
  setTemplateEngine,
  setLastSavedAt,
  setConfirmDialog,
}: UseAdminEventGamesInput) {
  const [attachDirectionId, setAttachDirectionId] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [configForm, setConfigForm] = useState(defaultConfigForm);
  const [updateEventGameId, setUpdateEventGameId] = useState("");
  const [updateConfigForm, setUpdateConfigForm] = useState(defaultConfigForm);
  const [editingGame, setEditingGame] = useState<AdminEventGameDTO | null>(null);

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.game_template_id === Number(selectedTemplateId)),
    [selectedTemplateId, templates],
  );

  const editingGameTemplate = useMemo(
    () => templates.find((template) => template.game_template_id === editingGame?.game_template_id),
    [editingGame, templates],
  );

  const attachMutation = useMutation({
    mutationFn: () =>
      adminApi.attachGame(eventId, Number(attachDirectionId), {
        game_template_id: Number(selectedTemplateId),
        config: toConfig(configForm),
      }),
    onSuccess: (res) => {
      setAttachDirectionId("");
      setSelectedTemplateId("");
      setConfigForm(defaultConfigForm);
      setUpdateEventGameId(String(res.data.event_game_id));
      setUpdateConfigForm(configToForm(res.data.config));
      setEditingGame(res.data);
      setLastSavedAt(new Date());
      invalidateEvent();
    },
  });

  const updateGameMutation = useMutation({
    mutationFn: () =>
      adminApi.updateEventGame(Number(updateEventGameId), {
        config: toConfig(updateConfigForm),
      }),
    onSuccess: (res) => {
      setEditingGame(res.data);
      setUpdateConfigForm(configToForm(res.data.config));
      setLastSavedAt(new Date());
      invalidateEvent();
    },
  });

  const deleteGameMutation = useMutation({
    mutationFn: (eventGameId: number) => adminApi.deleteEventGame(eventGameId),
    onSuccess: (_, eventGameId) => {
      if (editingGame?.event_game_id === eventGameId) {
        setEditingGame(null);
        setUpdateEventGameId("");
      }
      setLastSavedAt(new Date());
      invalidateEvent();
    },
  });

  const selectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const template = templates.find((item) => item.game_template_id === Number(templateId));
    if (template) setConfigForm(getTemplateDefaultConfigForm(template));
  };

  const handleAttach = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validateConfigForm(configForm, selectedTemplate?.question_stats);
    if (validationError) {
      setClientError(validationError);
      return;
    }
    setClientError(null);
    attachMutation.mutate();
  };

  const handleUpdateGame = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!updateEventGameId) {
      setClientError("Сначала добавьте игру или выберите игру для настройки.");
      return;
    }
    const validationError = validateConfigForm(updateConfigForm, editingGameTemplate?.question_stats);
    if (validationError) {
      setClientError(validationError);
      return;
    }
    setClientError(null);
    updateGameMutation.mutate();
  };

  const handleEditGame = (game: AdminEventGameDTO) => {
    setEditingGame(game);
    setUpdateEventGameId(String(game.event_game_id));
    setUpdateConfigForm(configToForm(game.config));
  };

  const handleDeleteGame = (game: AdminEventGameDTO) => {
    setConfirmDialog({
      title: "Удалить игру",
      message: `Игра "${game.title}" будет удалена из черновика мероприятия.`,
      confirmLabel: "Удалить",
      tone: "danger",
      onConfirm: () => deleteGameMutation.mutate(game.event_game_id),
    });
  };

  return {
    templateEngine,
    attachDirectionId,
    selectedTemplateId,
    selectedTemplate,
    configForm,
    editingGame,
    editingGameTemplate,
    updateEventGameId,
    updateConfigForm,
    attachMutation,
    updateGameMutation,
    deleteGameMutation,
    setTemplateEngine,
    setAttachDirectionId,
    setConfigForm,
    setUpdateConfigForm,
    setEditingGame,
    selectTemplate,
    handleAttach,
    handleUpdateGame,
    handleEditGame,
    handleDeleteGame,
  };
}
