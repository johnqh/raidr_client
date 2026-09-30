/**
 * Stale times (ms) for raidr queries. The catalog changes only when a crawl
 * publishes, so lists and details can sit for minutes.
 */
export const STALE_TIMES = {
  /** Health check — short, it monitors availability (1 min). */
  HEALTH: 1 * 60 * 1000,
  /** MCP, skill and site lists (5 min). */
  CATALOG: 5 * 60 * 1000,
  /** One MCP, skill or site (10 min). */
  DETAIL: 10 * 60 * 1000,
} as const;
