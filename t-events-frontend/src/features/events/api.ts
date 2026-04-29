import { api } from "@/lib/api/client";
import type {
  EventResponse,
  EventsResponse,
  DirectionsResponse,
  DirectionResponse,
  DirectionGamesResponse,
  DirectionLeaderboardResponse,
  StartOrResumeSessionResponse,
  SessionStateResponse,
  SubmitAnswerResponse,
} from "@/lib/api/types";
import {
  parseDirectionGamesResponse,
  parseDirectionLeaderboardResponse,
  parseDirectionResponse,
  parseDirectionsResponse,
  parseEventResponse,
  parseEventsResponse,
  parseSessionStateResponse,
  parseStartOrResumeSessionResponse,
  parseSubmitAnswerResponse,
} from "./eventContracts";

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
  list: () => api.get<EventsResponse>("/events").then(parseEventsResponse),
  getById: (id: number) => api.get<EventResponse>(`/events/${id}`).then(parseEventResponse),
  directions: (eventId: number) => api.get<DirectionsResponse>(`/events/${eventId}/directions`).then(parseDirectionsResponse),
  directionById: (eventId: number, directionId: number) =>
    api.get<DirectionResponse>(`/events/${eventId}/directions/${directionId}`).then(parseDirectionResponse),
  directionLeaderboard: (
    eventId: number,
    directionId: number,
    params: { limit?: number; offset?: number } = {}
  ) => {
    const searchParams = new URLSearchParams();
    if (params.limit !== undefined) searchParams.set("limit", String(params.limit));
    if (params.offset !== undefined) searchParams.set("offset", String(params.offset));
    const query = searchParams.toString();
    return api.get<DirectionLeaderboardResponse>(
      `/events/${eventId}/directions/${directionId}/leaderboard${query ? `?${query}` : ""}`
    ).then(parseDirectionLeaderboardResponse);
  },
  directionGames: (eventId: number, directionId: number) =>
    api.get<DirectionGamesResponse>(`/events/${eventId}/directions/${directionId}/games`).then(parseDirectionGamesResponse),
  startOrResumeSession: (eventId: number, directionId: number, eventGameId: number) =>
    api.post<StartOrResumeSessionResponse>(
      `/events/${eventId}/directions/${directionId}/games/${eventGameId}/sessions`
    ).then(parseStartOrResumeSessionResponse),
  getSessionState: (eventId: number, directionId: number, eventGameId: number, sessionId: number) =>
    api.get<SessionStateResponse>(
      `/events/${eventId}/directions/${directionId}/games/${eventGameId}/sessions/${sessionId}`
    ).then(parseSessionStateResponse),
  setCurrentQuestion: (
    eventId: number,
    directionId: number,
    eventGameId: number,
    sessionId: number,
    questionIndex: number
  ) =>
    api.patch<SessionStateResponse>(
      `/events/${eventId}/directions/${directionId}/games/${eventGameId}/sessions/${sessionId}/current-question`,
      { question_index: questionIndex }
    ).then(parseSessionStateResponse),
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
    ).then(parseSubmitAnswerResponse),
};
