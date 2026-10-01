/**
 * Query key factory for raidr TanStack Query hooks.
 *
 * All keys start with `["raidr"]`, then branch by resource; list keys carry
 * their filter object so distinct filters cache separately.
 */
import type {
  CrawlJobListQueryParams,
  ListQueryParams,
  SiteListQueryParams,
} from "@sudobility/raidr_types";

const raidrBase = () => ["raidr"] as const;

/**
 * Hooks always pass a filter object (`params ?? {}`), so a list is cached as
 * `["raidr", "mcps", {...}]`. Calling a list key with no argument gives the
 * two-element prefix, which mutations use to invalidate every filtered page.
 * Detail keys use the singular (`mcp`, `skill`, `site`) so they never match a
 * list prefix.
 */
export const queryKeys = {
  raidr: {
    /** Root key for every raidr query. Use for bulk invalidation. */
    all: raidrBase,
    /** `useRaidrHealth`. */
    health: () => [...raidrBase(), "health"] as const,
    /** MCP list; omit `filters` for the prefix that matches every page. */
    mcps: (filters?: ListQueryParams) =>
      filters
        ? ([...raidrBase(), "mcps", filters] as const)
        : ([...raidrBase(), "mcps"] as const),
    /** One MCP by API host. */
    mcp: (apiHost: string) => [...raidrBase(), "mcp", apiHost] as const,
    /** Public summary of one MCP; a separate key so auth changes never mix it with the full row. */
    mcpSummary: (apiHost: string) =>
      [...raidrBase(), "mcp-summary", apiHost] as const,
    /** Skill list; omit `filters` for the prefix that matches every page. */
    skills: (filters?: ListQueryParams) =>
      filters
        ? ([...raidrBase(), "skills", filters] as const)
        : ([...raidrBase(), "skills"] as const),
    /** One skill by API host. */
    skill: (apiHost: string) => [...raidrBase(), "skill", apiHost] as const,
    /** Site list (filters include `apiHost`); omit `filters` for the prefix. */
    sites: (filters?: SiteListQueryParams) =>
      filters
        ? ([...raidrBase(), "sites", filters] as const)
        : ([...raidrBase(), "sites"] as const),
    /** One site by origin (unencoded). */
    site: (origin: string) => [...raidrBase(), "site", origin] as const,
    /** MCP servers made from one site. */
    siteMcps: (origin: string) =>
      [...raidrBase(), "site-mcps", origin] as const,
    /** Skills made from one site. */
    siteSkills: (origin: string) =>
      [...raidrBase(), "site-skills", origin] as const,
    /** Crawl queue; omit `filters` for the prefix that matches every page. */
    crawlJobs: (filters?: CrawlJobListQueryParams) =>
      filters
        ? ([...raidrBase(), "crawl-jobs", filters] as const)
        : ([...raidrBase(), "crawl-jobs"] as const),
  },
} as const;
