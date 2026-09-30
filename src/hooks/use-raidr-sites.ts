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
  PaginatedResponse,
  Site,
  SiteListQueryParams,
  SiteUpsertRequest,
} from "@sudobility/raidr_types";
import { queryKeys } from "./query-keys";
import { STALE_TIMES } from "./query-config";
import { useRaidrClient } from "./use-raidr-client";

type QueryOpts<T> = Omit<UseQueryOptions<T>, "queryKey" | "queryFn">;

export const useRaidrSites = (
  networkClient: NetworkClient,
  baseUrl: string,
  params?: SiteListQueryParams,
  options?: QueryOpts<PaginatedResponse<Site>>,
): UseQueryResult<PaginatedResponse<Site>> => {
  const client = useRaidrClient(networkClient, baseUrl);
  return useQuery({
    queryKey: queryKeys.raidr.sites(params ?? {}),
    queryFn: () => client.getSites(params),
    staleTime: STALE_TIMES.CATALOG,
    ...options,
  });
};

export const useRaidrSite = (
  networkClient: NetworkClient,
  baseUrl: string,
  origin: string,
  options?: QueryOpts<BaseResponse<Site>>,
): UseQueryResult<BaseResponse<Site>> => {
  const client = useRaidrClient(networkClient, baseUrl);
  return useQuery({
    queryKey: queryKeys.raidr.site(origin),
    queryFn: () => client.getSite(origin),
    staleTime: STALE_TIMES.DETAIL,
    ...options,
    enabled: origin.length > 0 && (options?.enabled ?? true),
  });
};

export const useRaidrUpsertSite = (
  networkClient: NetworkClient,
  baseUrl: string,
): UseMutationResult<
  BaseResponse<Site>,
  Error,
  { token: string; origin: string; data: SiteUpsertRequest }
> => {
  const client = useRaidrClient(networkClient, baseUrl);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ token, origin, data }) =>
      client.upsertSite(token, origin, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.raidr.sites() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.raidr.site(variables.origin),
      });
    },
  });
};
