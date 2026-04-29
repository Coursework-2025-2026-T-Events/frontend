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
  CreateEventGameRequest,
  DeleteEventGameResponse,
  GameEngine,
  GameTemplatesResponse,
  PublishCheckResponse,
  RemoveDirectionResponse,
  UpdateEventGameRequest,
} from "@/lib/api/types";

export const adminApi = {
  listEvents: () => api.get<AdminEventsResponse>("/admin/events"),
  createEvent: (payload: AdminEventCreateRequest) => api.post<AdminEventResponse>("/admin/events", payload),
  getEvent: (eventId: number) => api.get<AdminEventResponse>(`/admin/events/${eventId}`),
  getEventSettings: (eventId: number) =>
    api.get<AdminEventSettingsResponse>(`/admin/events/${eventId}/settings`),
  listDirections: (params: { query?: string; limit?: number; offset?: number } = {}) => {
    const searchParams = new URLSearchParams();
    if (params.query) searchParams.set("query", params.query);
    if (params.limit !== undefined) searchParams.set("limit", String(params.limit));
    if (params.offset !== undefined) searchParams.set("offset", String(params.offset));
    const query = searchParams.toString();
    return api.get<AdminDirectionsResponse>(`/admin/directions${query ? `?${query}` : ""}`);
  },
  replaceEvent: (eventId: number, payload: AdminEventPutRequest) =>
    api.put<AdminEventResponse>(`/admin/events/${eventId}`, payload),
  updateEvent: (eventId: number, payload: AdminEventPatchRequest) =>
    api.patch<AdminEventResponse>(`/admin/events/${eventId}`, payload),
  updateSchedule: (eventId: number, payload: AdminEventSchedulePatchRequest) =>
    api.patch<AdminEventResponse>(`/admin/events/${eventId}/schedule`, payload),
  addDirection: (eventId: number, directionId: number) =>
    api.post<AddDirectionResponse>(`/admin/events/${eventId}/directions`, {
      direction_id: directionId,
    }),
  removeDirection: (eventId: number, directionId: number) =>
    api.delete<RemoveDirectionResponse>(`/admin/events/${eventId}/directions/${directionId}`),
  checkPublish: (eventId: number) => api.get<PublishCheckResponse>(`/admin/events/${eventId}/publish-check`),
  publishEvent: (eventId: number) => api.post<AdminEventResponse>(`/admin/events/${eventId}/publish`),
  archiveEvent: (eventId: number) => api.post<ArchiveEventResponse>(`/admin/events/${eventId}/archive`),
  listGameTemplates: (engine?: GameEngine) => {
    const query = engine ? `?engine=${encodeURIComponent(engine)}` : "";
    return api.get<GameTemplatesResponse>(`/admin/game-templates${query}`);
  },
  attachGame: (eventId: number, directionId: number, payload: CreateEventGameRequest) =>
    api.post<AdminEventGameResponse>(`/admin/events/${eventId}/directions/${directionId}/games`, payload),
  listEventGames: (eventId: number) => api.get<AdminEventGamesResponse>(`/admin/events/${eventId}/games`),
  updateEventGame: (eventGameId: number, payload: UpdateEventGameRequest) =>
    api.patch<AdminEventGameResponse>(`/admin/event-games/${eventGameId}`, payload),
  deleteEventGame: (eventGameId: number) =>
    api.delete<DeleteEventGameResponse>(`/admin/event-games/${eventGameId}`),
};
