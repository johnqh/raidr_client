/**
 * Hooks for the MCP catalog. Reads are public; mutations take the shared
 * API key as `token` and invalidate the list and the affected detail key.
 */
import {
  useMutation,
  type UseMutationResult,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";
import type { NetworkClient } from "@sudobility/types";
import type {
  BaseResponse,
  ListQueryParams,
  Mcp,
  McpSummary,
  McpUpsertRequest,
  PaginatedResponse,
} from "@sudobility/raidr_types";
import { queryKeys } from "./query-keys";
import { STALE_TIMES } from "./query-config";
import { useRaidrClient } from "./use-raidr-client";

type QueryOpts<T> = Omit<UseQueryOptions<T>, "queryKey" | "queryFn">;

export const useRaidrMcps = (
  networkClient: NetworkClient,
  baseUrl: string,
  params?: ListQueryParams,
  options?: QueryOpts<PaginatedResponse<McpSummary>>,
): UseQueryResult<PaginatedResponse<McpSummary>> => {
  const client = useRaidrClient(networkClient, baseUrl);
  return useQuery({
    queryKey: queryKeys.raidr.mcps(params ?? {}),
    queryFn: () => client.getMcps(params),
    staleTime: STALE_TIMES.CATALOG,
    ...options,
  });
};

export const useRaidrMcp = (
  networkClient: NetworkClient,
  baseUrl: string,
  apiHost: string,
  options?: QueryOpts<BaseResponse<Mcp>>,
): UseQueryResult<BaseResponse<Mcp>> => {
  const client = useRaidrClient(networkClient, baseUrl);
  return useQuery({
    queryKey: queryKeys.raidr.mcp(apiHost),
    queryFn: () => client.getMcp(apiHost),
    staleTime: STALE_TIMES.DETAIL,
    ...options,
    enabled: apiHost.length > 0 && (options?.enabled ?? true),
  });
};

export const useRaidrUpsertMcp = (
  networkClient: NetworkClient,
  baseUrl: string,
): UseMutationResult<
  BaseResponse<Mcp>,
  Error,
  { token: string; apiHost: string; data: McpUpsertRequest }
> => {
  const client = useRaidrClient(networkClient, baseUrl);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ token, apiHost, data }) =>
      client.upsertMcp(token, apiHost, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.raidr.mcps() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.raidr.mcp(variables.apiHost),
      });
    },
  });
};

export const useRaidrDeleteMcp = (
  networkClient: NetworkClient,
  baseUrl: string,
): UseMutationResult<
  BaseResponse<Mcp>,
  Error,
  { token: string; apiHost: string }
> => {
  const client = useRaidrClient(networkClient, baseUrl);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ token, apiHost }) => client.deleteMcp(token, apiHost),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.raidr.mcps() });
      queryClient.removeQueries({
        queryKey: queryKeys.raidr.mcp(variables.apiHost),
      });
    },
  });
};
