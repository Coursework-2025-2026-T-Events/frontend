export const queryKeys = {
  auth: {
    bootstrapSession: ["auth", "bootstrap-session"] as const,
  },
  events: {
    list: ["events"] as const,
    inventoryFilterOptions: ["events", "inventory-filter-options"] as const,
    detail: (eventId: number) => ["event", eventId] as const,
    direction: (eventId: number, directionId: number | null) => ["direction", eventId, directionId] as const,
    directions: (eventId: number) => ["directions", eventId] as const,
    inventoryDirectionFilterOptions: (eventId: number) => ["directions", "inventory-filter-options", eventId] as const,
    directionGames: (eventId: number, directionId: number) => ["direction-games", eventId, directionId] as const,
    directionLeaderboard: (eventId: number, directionId: number, limit: number, offset: number) =>
      ["direction-leaderboard", eventId, directionId, limit, offset] as const,
    gameSessionState: (eventId: number, directionId: number, eventGameId: number, sessionId: number | null) =>
      ["game-session-state", eventId, directionId, eventGameId, sessionId] as const,
  },
  admin: {
    events: ["admin", "events"] as const,
    eventSettings: (eventId: number) => ["admin", "event-settings", eventId] as const,
    gameTemplates: (engine: string) => ["admin", "game-templates", engine] as const,
    directions: ["admin", "directions"] as const,
  },
  reward: {
    status: (eventId: number, directionId: number | null) => ["reward-status", eventId, directionId] as const,
    standerRedemptions: (filters: unknown, offset: number) => ["stander", "event-redemptions", filters, offset] as const,
  },
} as const;
