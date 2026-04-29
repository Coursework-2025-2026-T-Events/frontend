"use client";

import { ArrowLeft } from "lucide-react";
import clsx from "clsx";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import ErrorMessage from "@/components/ui/ErrorMessage";
import LoadingState from "@/components/ui/LoadingState";
import Typography from "@/components/ui/Typography";
import ConfirmationDialog from "@/features/admin/ConfirmationDialog";
import DirectionsPanel from "@/features/admin/DirectionsPanel";
import EventDetailsForm from "@/features/admin/EventDetailsForm";
import GamesPanel from "@/features/admin/GamesPanel";
import PublishPanel from "@/features/admin/PublishPanel";
import SettingsTabButton from "@/features/admin/SettingsTabButton";
import { useAdminEventDetailPage } from "@/features/admin/useAdminEventDetailPage";
import RequireAuth from "@/features/auth/RequireAuth";
import { getErrorMessage } from "@/lib/getErrorMessage";

export default function AdminEventDetailClient() {
  const page = useAdminEventDetailPage();

  return (
    <RequireAuth allowedRoles={["admin"]}>
      <div className="min-h-[calc(100vh-4rem)] bg-[var(--color-brand-mist)] pb-14">
        <Container>
          <div className="py-4 sm:py-8 lg:py-10">
            <Button
              type="button"
              variant="ghost"
              onClick={page.handleBackToEvents}
              className="-ml-3 mb-4 min-h-10 gap-2 px-3 text-[14px] text-[var(--color-brand-muted)] hover:bg-white/70"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              К админ-панели
            </Button>

            <section className="rounded-[var(--radius-lg)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-7 lg:p-8">
              <div className="min-w-0 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  {page.status && (
                    <span
                      className={clsx(
                        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-medium leading-[18px]",
                        page.status.className
                      )}
                    >
                      <span className={clsx("h-1.5 w-1.5 rounded-full", page.status.dot)} aria-hidden />
                      {page.status.label}
                    </span>
                  )}
                </div>
                <h1 className="mt-4 text-[30px] font-bold leading-9 text-[var(--color-brand-ink)] sm:text-[44px] sm:leading-[48px]">
                  {page.event?.title || page.adminEventDetails.currentEventForm.title || "Настройка мероприятия"}
                </h1>
                <Typography className="mt-3 text-[var(--color-brand-graphite)]" size="sm">
                  {page.saveStatusText}
                </Typography>
              </div>
            </section>

            <div
              role="tablist"
              aria-label="Разделы настройки мероприятия"
              className="sticky top-16 z-20 -mx-4 mt-4 flex gap-2 overflow-x-auto border-y border-[var(--color-brand-line)] bg-[var(--color-brand-mist)]/95 px-4 py-3 backdrop-blur [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:rounded-[var(--radius-lg)] sm:border sm:bg-white sm:shadow-[var(--shadow-card)] [&::-webkit-scrollbar]:hidden"
            >
              {page.tabs.map((tab) => (
                <SettingsTabButton
                  key={tab.id}
                  tab={tab}
                  isActive={page.activeTab === tab.id}
                  onKeyDown={(event) => page.handleTabKeyDown(event, tab.id)}
                  onSelect={() => page.selectTab(tab.id)}
                />
              ))}
            </div>

            <div className="mt-5 space-y-5">
              {page.eventQuery.isLoading && <LoadingState message="Загрузка мероприятия..." />}

              {page.eventQuery.error && (
                <ErrorMessage
                  message={getErrorMessage(page.eventQuery.error, "Не удалось загрузить мероприятие")}
                  actionLabel={page.eventQuery.isFetching ? "Повторяем..." : "Повторить"}
                  onAction={() => page.eventQuery.refetch()}
                />
              )}

              {page.clientError && (
                <Typography className="rounded-[var(--radius-md)] bg-red-50 px-4 py-3 text-red-700" size="sm">
                  {page.clientError}
                </Typography>
              )}

              {page.activeTab === "details" && (
                <EventDetailsForm
                  form={page.adminEventDetails.currentEventForm}
                  fieldErrors={page.adminEventDetails.fieldErrors}
                  changedFieldLabels={page.adminEventDetails.changedFieldLabels}
                  hasEventChanges={page.adminEventDetails.hasChanges}
                  isArchived={page.isArchived}
                  canEditDraftFields={page.adminEventDetails.canEditDraftFields}
                  canEditScheduleFields={page.adminEventDetails.canEditScheduleFields}
                  canEditRewardFields={page.adminEventDetails.canEditRewardFields}
                  canSaveDetails={page.adminEventDetails.canSave}
                  isSavingDetails={page.adminEventDetails.isSaving}
                  primaryActionLabel={page.primaryDetailsActionLabel}
                  eventError={page.eventError}
                  onFieldChange={page.adminEventDetails.updateField}
                  onReset={page.adminEventDetails.resetForm}
                  onSubmit={page.handleEventSubmit}
                />
              )}

              {page.activeTab === "directions" && (
                <DirectionsPanel
                  eventDirections={page.eventDirections}
                  availableDirections={page.adminEventDirections.availableDirections}
                  directionId={page.adminEventDirections.directionId}
                  removeDirectionId={page.adminEventDirections.removeDirectionId}
                  isDraft={page.isDraft}
                  isCatalogLoading={page.adminEventDirections.directionsQuery.isLoading}
                  isAddPending={page.adminEventDirections.addDirectionMutation.isPending}
                  isRemovePending={page.adminEventDirections.removeDirectionMutation.isPending}
                  catalogError={page.adminEventDirections.directionsQuery.error}
                  mutationError={page.adminEventDirections.addDirectionMutation.error ?? page.adminEventDirections.removeDirectionMutation.error}
                  onDirectionChange={page.adminEventDirections.setDirectionId}
                  onRemoveDirectionChange={page.adminEventDirections.setRemoveDirectionId}
                  onAddDirection={page.handleAddDirection}
                  onRemoveDirection={page.handleRemoveDirection}
                />
              )}

              {page.activeTab === "games" && (
                <GamesPanel
                  isDraft={page.isDraft}
                  eventDirections={page.eventDirections}
                  eventGames={page.eventGames}
                  gamesByDirection={page.gamesByDirection}
                  gamesWithoutDirection={page.gamesWithoutDirection}
                  templates={page.templates}
                  templateEngine={page.adminEventGames.templateEngine}
                  attachDirectionId={page.adminEventGames.attachDirectionId}
                  selectedTemplateId={page.adminEventGames.selectedTemplateId}
                  selectedTemplate={page.adminEventGames.selectedTemplate}
                  configForm={page.adminEventGames.configForm}
                  editingGame={page.adminEventGames.editingGame}
                  editingGameTemplate={page.adminEventGames.editingGameTemplate}
                  updateEventGameId={page.adminEventGames.updateEventGameId}
                  updateConfigForm={page.adminEventGames.updateConfigForm}
                  isAttachPending={page.adminEventGames.attachMutation.isPending}
                  isUpdatePending={page.adminEventGames.updateGameMutation.isPending}
                  isDeletePending={page.adminEventGames.deleteGameMutation.isPending}
                  attachError={page.adminEventGames.attachMutation.error}
                  updateError={page.adminEventGames.updateGameMutation.error}
                  deleteError={page.adminEventGames.deleteGameMutation.error}
                  onTemplateEngineChange={page.adminEventGames.setTemplateEngine}
                  onAttachDirectionChange={page.adminEventGames.setAttachDirectionId}
                  onSelectedTemplateChange={page.adminEventGames.selectTemplate}
                  onConfigFormChange={page.adminEventGames.setConfigForm}
                  onUpdateConfigFormChange={page.adminEventGames.setUpdateConfigForm}
                  onAttach={page.adminEventGames.handleAttach}
                  onUpdateGame={page.adminEventGames.handleUpdateGame}
                  onEditGame={page.adminEventGames.handleEditGame}
                  onDeleteGame={page.adminEventGames.handleDeleteGame}
                  onCancelEdit={() => page.adminEventGames.setEditingGame(null)}
                />
              )}

              {page.activeTab === "publish" && (
                <PublishPanel
                  isDraft={page.isDraft}
                  isArchived={page.isArchived}
                  publishReady={page.adminEventPublication.publishReady}
                  hasEventChanges={page.adminEventDetails.hasChanges}
                  publishChecklist={page.adminEventPublication.publishChecklist}
                  statusLabel={page.status?.label}
                  eventLifecycleSummary={page.eventLifecycleSummary}
                  isPublishPending={page.adminEventPublication.publishMutation.isPending}
                  isArchivePending={page.adminEventPublication.archiveMutation.isPending}
                  eventError={page.eventError}
                  archiveError={page.adminEventPublication.archiveMutation.error}
                  onPublish={page.adminEventPublication.publish}
                  onArchive={page.adminEventPublication.requestArchive}
                  onSelectTab={page.selectTab}
                />
              )}
            </div>
          </div>
        </Container>
        <ConfirmationDialog
          state={page.confirmDialog}
          onCancel={page.handleConfirmDialogCancel}
          onConfirm={page.handleConfirmDialogConfirm}
        />
      </div>
    </RequireAuth>
  );
}
