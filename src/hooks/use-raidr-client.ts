import { useMemo } from "react";
import type { NetworkClient } from "@sudobility/types";
import { RaidrClient } from "../network/raidr-client";

/**
 * Memoized client so hooks do not rebuild it on every render. Keyed on the
 * NetworkClient identity and base URL, so pass a stable NetworkClient (the
 * app passes the module-level `webNetworkClient`).
 */
export function useRaidrClient(
  networkClient: NetworkClient,
  baseUrl: string,
): RaidrClient {
  return useMemo(
    () => new RaidrClient(networkClient, baseUrl),
    [networkClient, baseUrl],
  );
}
