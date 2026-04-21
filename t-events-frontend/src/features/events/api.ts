import { api } from "@/lib/api/client";
import type {
  EventResponse,
  EventsResponse,
  DirectionsResponse,
  DirectionResponse,
  DirectionGamesResponse,
  StartOrResumeSessionResponse,
  SessionStateResponse,
  SubmitAnswerResponse,
} from "@/lib/api/types";

export type SubmitAnswerPayload =
  | {
      answer: {
        text_answer: string;
      };
    }
  | {
      answer: {
        option_id: number;
      };
    };

export const eventsApi = {
  list: () => api.get<EventsResponse>("/events"),
  getById: (id: number) => api.get<EventResponse>(`/events/${id}`),
  directions: (eventId: number) => api.get<DirectionsResponse>(`/events/${eventId}/directions`),
  directionById: (eventId: number, directionId: number) =>
    api.get<DirectionResponse>(`/events/${eventId}/directions/${directionId}`),
  directionGames: (eventId: number, directionId: number) =>
    api.get<DirectionGamesResponse>(`/events/${eventId}/directions/${directionId}/games`),
  startOrResumeSession: (eventId: number, directionId: number, eventGameId: number) =>
    api.post<StartOrResumeSessionResponse>(
      `/events/${eventId}/directions/${directionId}/games/${eventGameId}/sessions`
    ),
  getSessionState: (eventId: number, directionId: number, eventGameId: number, sessionId: number) =>
    api.get<SessionStateResponse>(
      `/events/${eventId}/directions/${directionId}/games/${eventGameId}/sessions/${sessionId}`
    ),
  submitAnswer: (
    eventId: number,
    directionId: number,
    eventGameId: number,
    sessionId: number,
    payload: SubmitAnswerPayload
  ) =>
    api.post<SubmitAnswerResponse>(
      `/events/${eventId}/directions/${directionId}/games/${eventGameId}/sessions/${sessionId}/answers`,
      payload
    ),
};