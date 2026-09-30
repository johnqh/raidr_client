import { useMemo } from "react";
import type { NetworkClient } from "@sudobility/types";
import { RaidrClient } from "../network/raidr-client";

/** Memoized client so hooks do not rebuild it on every render. */
export function useRaidrClient(
  networkClient: NetworkClient,
  baseUrl: string,
): RaidrClient {
  return useMemo(
    () => new RaidrClient(networkClient, baseUrl),
    [networkClient, baseUrl],
  );
}
