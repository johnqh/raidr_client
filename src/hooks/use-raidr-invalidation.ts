import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./query-keys";

/** Invalidate every raidr query, e.g. after a crawl publishes new records. */
export function useRaidrInvalidation() {
  const queryClient = useQueryClient();
  return useCallback(
    () => queryClient.invalidateQueries({ queryKey: queryKeys.raidr.all() }),
    [queryClient],
  );
}
