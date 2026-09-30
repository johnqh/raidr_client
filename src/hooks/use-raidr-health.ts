import {
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";
import type { NetworkClient } from "@sudobility/types";
import type { BaseResponse, HealthCheckData } from "@sudobility/raidr_types";
import { queryKeys } from "./query-keys";
import { STALE_TIMES } from "./query-config";
import { useRaidrClient } from "./use-raidr-client";

export const useRaidrHealth = (
  networkClient: NetworkClient,
  baseUrl: string,
  options?: Omit<
    UseQueryOptions<BaseResponse<HealthCheckData>>,
    "queryKey" | "queryFn"
  >,
): UseQueryResult<BaseResponse<HealthCheckData>> => {
  const client = useRaidrClient(networkClient, baseUrl);
  return useQuery({
    queryKey: queryKeys.raidr.health(),
    queryFn: () => client.getHealth(),
    staleTime: STALE_TIMES.HEALTH,
    ...options,
  });
};
