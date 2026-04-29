import { api } from "@/lib/api/client";
import type {
  AdminEventCreateRequest,
  AdminEventPatchRequest,
  AdminEventPutRequest,
  AdminEventResponse,
  AdminEventSchedulePatchRequest,
  AdminEventSettingsResponse,
  AdminEventsResponse,
  AdminDirectionsResponse,
  AdminEventGamesResponse,
  AdminEventGameResponse,
  AddDirectionResponse,
  ArchiveEventResponse,
  AuditLogExportQuery,
  CreateEventGameRequest,
  DeleteEventGameResponse,
  GameEngine,
  GameTemplatesResponse,
  PublishCheckResponse,
  RemoveDirectionResponse,
  UpdateEventGameRequest,
} from "@/lib/api/types";
import {
  parseAddDirectionResponse,
  parseAdminDirectionsResponse,
  parseAdminEventGameResponse,
  parseAdminEventGamesResponse,
  parseAdminEventResponse,
  parseAdminEventSettingsResponse,
  parseAdminEventsResponse,
  parseArchiveEventResponse,
  parseDeleteEventGameResponse,
  parseGameTemplatesResponse,
  parsePublishCheckResponse,
  parseRemoveDirectionResponse,
} from "./adminContracts";

function buildAuditLogExportQuery(params: AuditLogExportQuery = {}) {
  const searchParams = new URLSearchParams();

  if (params.actor_user_id !== undefined) searchParams.set("actor_user_id", String(params.actor_user_id));
  if (params.event_id !== undefined) searchParams.set("event_id", String(params.event_id));
  if (params.action) searchParams.set("action", params.action);
  if (params.entity_type) searchParams.set("entity_type", params.entity_type);
  if (params.from) searchParams.set("from", params.from);
  if (params.to) searchParams.set("to", params.to);
  if (params.limit !== undefined) searchParams.set("limit", String(params.limit));
  if (params.offset !== undefined) searchParams.set("offset", String(params.offset));

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export const adminApi = {
  listEvents: () => api.get<AdminEventsResponse>("/admin/events").then(parseAdminEventsResponse),
  createEvent: (payload: AdminEventCreateRequest) =>
    api.post<AdminEventResponse>("/admin/events", payload).then(parseAdminEventResponse),
  getEvent: (eventId: number) => api.get<AdminEventResponse>(`/admin/events/${eventId}`).then(parseAdminEventResponse),
  getEventSettings: (eventId: number) =>
    api.get<AdminEventSettingsResponse>(`/admin/events/${eventId}/settings`).then(parseAdminEventSettingsResponse),
  listDirections: (params: { query?: string; limit?: number; offset?: number } = {}) => {
    const searchParams = new URLSearchParams();
    if (params.query) searchParams.set("query", params.query);
    if (params.limit !== undefined) searchParams.set("limit", String(params.limit));
    if (params.offset !== undefined) searchParams.set("offset", String(params.offset));
    const query = searchParams.toString();
    return api.get<AdminDirectionsResponse>(`/admin/directions${query ? `?${query}` : ""}`).then(parseAdminDirectionsResponse);
  },
  replaceEvent: (eventId: number, payload: AdminEventPutRequest) =>
    api.put<AdminEventResponse>(`/admin/events/${eventId}`, payload).then(parseAdminEventResponse),
  updateEvent: (eventId: number, payload: AdminEventPatchRequest) =>
    api.patch<AdminEventResponse>(`/admin/events/${eventId}`, payload).then(parseAdminEventResponse),
  updateSchedule: (eventId: number, payload: AdminEventSchedulePatchRequest) =>
    api.patch<AdminEventResponse>(`/admin/events/${eventId}/schedule`, payload).then(parseAdminEventResponse),
  addDirection: (eventId: number, directionId: number) =>
    api.post<AddDirectionResponse>(`/admin/events/${eventId}/directions`, {
      direction_id: directionId,
    }).then(parseAddDirectionResponse),
  removeDirection: (eventId: number, directionId: number) =>
    api.delete<RemoveDirectionResponse>(`/admin/events/${eventId}/directions/${directionId}`).then(parseRemoveDirectionResponse),
  checkPublish: (eventId: number) =>
    api.get<PublishCheckResponse>(`/admin/events/${eventId}/publish-check`).then(parsePublishCheckResponse),
  publishEvent: (eventId: number) =>
    api.post<AdminEventResponse>(`/admin/events/${eventId}/publish`).then(parseAdminEventResponse),
  archiveEvent: (eventId: number) =>
    api.post<ArchiveEventResponse>(`/admin/events/${eventId}/archive`).then(parseArchiveEventResponse),
  listGameTemplates: (engine?: GameEngine) => {
    const query = engine ? `?engine=${encodeURIComponent(engine)}` : "";
    return api.get<GameTemplatesResponse>(`/admin/game-templates${query}`).then(parseGameTemplatesResponse);
  },
  attachGame: (eventId: number, directionId: number, payload: CreateEventGameRequest) =>
    api
      .post<AdminEventGameResponse>(`/admin/events/${eventId}/directions/${directionId}/games`, payload)
      .then(parseAdminEventGameResponse),
  listEventGames: (eventId: number) =>
    api.get<AdminEventGamesResponse>(`/admin/events/${eventId}/games`).then(parseAdminEventGamesResponse),
  updateEventGame: (eventGameId: number, payload: UpdateEventGameRequest) =>
    api.patch<AdminEventGameResponse>(`/admin/event-games/${eventGameId}`, payload).then(parseAdminEventGameResponse),
  deleteEventGame: (eventGameId: number) =>
    api.delete<DeleteEventGameResponse>(`/admin/event-games/${eventGameId}`).then(parseDeleteEventGameResponse),
  exportAuditLogsCsv: (params: AuditLogExportQuery = {}) =>
    api.get<string>(`/admin/audit-logs/export.csv${buildAuditLogExportQuery(params)}`),
};
