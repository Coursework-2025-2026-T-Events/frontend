import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type ParticipationState = {
  eventId: number | null;
  directionId: number | null;
  selectedAt: string | null;
  selectDirection: (eventId: number, directionId: number) => void;
  clear: () => void;
};

export const useParticipationStore = create<ParticipationState>()(
  persist(
    (set) => ({
      eventId: null,
      directionId: null,
      selectedAt: null,
      selectDirection: (eventId, directionId) =>
        set({ eventId, directionId, selectedAt: new Date().toISOString() }),
      clear: () => set({ eventId: null, directionId: null, selectedAt: null }),
    }),
    {
      name: "t-events-participation",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);