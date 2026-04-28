import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ParticipationMeta, ParticipationSnapshot } from "./model";
import { mergeParticipationMeta } from "./model";

type ParticipationState = ParticipationSnapshot & {
  selectDirection: (eventId: number, directionId: number, meta?: ParticipationMeta) => void;
  markVerified: (meta?: ParticipationMeta) => void;
  clear: () => void;
};

const emptySelection: ParticipationSnapshot = {
  eventId: null,
  directionId: null,
  eventTitle: null,
  directionName: null,
  selectedAt: null,
  verifiedAt: null,
};

export const useParticipationStore = create<ParticipationState>()(
  persist(
    (set, get) => ({
      ...emptySelection,
      selectDirection: (eventId, directionId, meta) =>
        set((state) => ({
          eventId,
          directionId,
          ...mergeParticipationMeta(state, meta),
          selectedAt: new Date().toISOString(),
          verifiedAt: null,
        })),
      markVerified: (meta) => {
        if (get().eventId === null || get().directionId === null) return;
        set((state) => ({
          ...mergeParticipationMeta(state, meta),
          verifiedAt: new Date().toISOString(),
        }));
      },
      clear: () => set(emptySelection),
    }),
    {
      name: "t-events-participation",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        eventId: state.eventId,
        directionId: state.directionId,
        eventTitle: state.eventTitle,
        directionName: state.directionName,
        selectedAt: state.selectedAt,
        verifiedAt: state.verifiedAt,
      }),
    }
  )
);
