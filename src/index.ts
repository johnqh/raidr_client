/**
 * @sudobility/raidr_client - HTTP client and TanStack Query hooks for
 * raidr_api.
 *
 * Layer: raidr_types -> raidr_client -> raidr_lib -> raidr_app. Wire types
 * come from `@sudobility/raidr_types`; this package only moves them over HTTP
 * and caches them. Anything derived (paging state, connection snippets, error
 * classification) belongs in raidr_lib.
 */

// Network client
export { createRaidrClient, RaidrClient } from "./network";

// React hooks
export {
  queryKeys,
  STALE_TIMES,
  useRaidrClient,
  useRaidrDeleteMcp,
  useRaidrDeleteSkill,
  useRaidrHealth,
  useRaidrInvalidation,
  useRaidrMcp,
  useRaidrMcps,
  useRaidrSite,
  useRaidrSites,
  useRaidrSkill,
  useRaidrSkills,
  useRaidrUpsertMcp,
  useRaidrUpsertSite,
  useRaidrUpsertSkill,
} from "./hooks";
