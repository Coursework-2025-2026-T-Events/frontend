export const routes = {
  home: "/",
  events: "/events",
  currentParticipation: "/events/current",
  accessDeniedEvents: "/events?accessDenied=1",
  login: "/auth/login",
  register: "/auth/register",
  adminEvents: "/admin/events",
  standerScan: "/stander/scan",
  standerInventory: "/stander/inventory",
  event: (eventId: number) => `/events/${eventId}`,
  eventDirections: (eventId: number) => `/events/${eventId}/directions`,
  eventDirection: (eventId: number, directionId: number) => `/events/${eventId}/directions/${directionId}`,
  eventDirectionGames: (eventId: number, directionId: number) =>
    `/events/${eventId}/directions/${directionId}/games`,
  eventGame: (eventId: number, directionId: number, eventGameId: number) =>
    `/events/${eventId}/directions/${directionId}/games/${eventGameId}`,
  eventDirectionProgress: (eventId: number, directionId: number) =>
    `/events/${eventId}/directions/${directionId}/progress`,
  eventDirectionReward: (eventId: number, directionId: number) =>
    `/events/${eventId}/directions/${directionId}/reward`,
  legacyEventReward: (eventId: number) => `/events/${eventId}/reward`,
  adminEvent: (eventId: number) => `/admin/events/${eventId}`,
};
