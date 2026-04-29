import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/features/admin/api";
import { getAvailableDirections } from "@/features/admin/directions";
import type { AdminEventDirectionDTO } from "@/lib/api/types";
import { queryKeys } from "@/lib/queryKeys";

type UseAdminEventDirectionsParams = {
  eventId: number;
  eventDirections: AdminEventDirectionDTO[];
  setClientError: (message: string | null) => void;
  setLastSavedAt: (value: Date) => void;
};

export function useAdminEventDirections({
  eventId,
  eventDirections,
  setClientError,
  setLastSavedAt,
}: UseAdminEventDirectionsParams) {
  const queryClient = useQueryClient();
  const [directionId, setDirectionId] = useState("");
  const [removeDirectionId, setRemoveDirectionId] = useState("");

  const directionsQuery = useQuery({
    queryKey: queryKeys.admin.directions,
    queryFn: () => adminApi.listDirections({ limit: 100 }),
  });

  const availableDirections = useMemo(() => {
    return getAvailableDirections(directionsQuery.data?.data, eventDirections);
  }, [directionsQuery.data, eventDirections]);

  const invalidateDirections = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.eventSettings(eventId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.events });
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.directions });
  };

  const addDirectionMutation = useMutation({
    mutationFn: () => adminApi.addDirection(eventId, Number(directionId)),
    onSuccess: () => {
      setDirectionId("");
      setLastSavedAt(new Date());
      invalidateDirections();
    },
  });

  const removeDirectionMutation = useMutation({
    mutationFn: () => adminApi.removeDirection(eventId, Number(removeDirectionId)),
    onSuccess: () => {
      setRemoveDirectionId("");
      setLastSavedAt(new Date());
      invalidateDirections();
    },
  });

  const addDirection = () => {
    if (!directionId) {
      setClientError("Выберите направление из списка.");
      return;
    }

    setClientError(null);
    addDirectionMutation.mutate();
  };

  const removeDirection = () => {
    setClientError(null);
    removeDirectionMutation.mutate();
  };

  return {
    directionId,
    removeDirectionId,
    availableDirections,
    directionsQuery,
    addDirectionMutation,
    removeDirectionMutation,
    setDirectionId,
    setRemoveDirectionId,
    addDirection,
    removeDirection,
  };
}
