/**
 * Query key factory for raidr TanStack Query hooks.
 *
 * All keys start with `["raidr"]`, then branch by resource; list keys carry
 * their filter object so distinct filters cache separately.
 */
import type {
  ListQueryParams,
  SiteListQueryParams,
} from "@sudobility/raidr_types";

const raidrBase = () => ["raidr"] as const;

export const queryKeys = {
  raidr: {
    /** Root key for every raidr query. Use for bulk invalidation. */
    all: raidrBase,
    health: () => [...raidrBase(), "health"] as const,
    mcps: (filters?: ListQueryParams) =>
      filters
        ? ([...raidrBase(), "mcps", filters] as const)
        : ([...raidrBase(), "mcps"] as const),
    mcp: (apiHost: string) => [...raidrBase(), "mcp", apiHost] as const,
    skills: (filters?: ListQueryParams) =>
      filters
        ? ([...raidrBase(), "skills", filters] as const)
        : ([...raidrBase(), "skills"] as const),
    skill: (apiHost: string) => [...raidrBase(), "skill", apiHost] as const,
    sites: (filters?: SiteListQueryParams) =>
      filters
        ? ([...raidrBase(), "sites", filters] as const)
        : ([...raidrBase(), "sites"] as const),
    site: (origin: string) => [...raidrBase(), "site", origin] as const,
  },
} as const;
