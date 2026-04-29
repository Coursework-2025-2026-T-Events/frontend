export const queryKeys = {
  auth: {
    bootstrapSession: ["auth", "bootstrap-session"] as const,
  },
  events: {
    list: ["events"] as const,
    detail: (eventId: number) => ["event", eventId] as const,
    directions: (eventId: number) => ["directions", eventId] as const,
  },
  admin: {
    events: ["admin", "events"] as const,
    eventSettings: (eventId: number) => ["admin", "event-settings", eventId] as const,
    gameTemplates: (engine: string) => ["admin", "game-templates", engine] as const,
    directions: ["admin", "directions"] as const,
  },
} as const;
