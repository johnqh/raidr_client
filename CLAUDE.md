# CLAUDE.md — raidr_client

> **Git policy — never auto-commit or auto-push.** Leave your work in the working tree.
> Run `git commit`, `git push`, `gh pr create`, or `push_all.sh` **only when the user
> explicitly asks in that turn**. Approval for an earlier change does not carry forward, and
> finishing a task is not permission to commit it.

Network client + TanStack Query hooks for `raidr_api`. Published as
`@sudobility/raidr_client` (public). Bun only. Mirrors `sudojo_client`.

## Purpose and layer position

```
raidr_types  (wire types, header names, path helpers)
     │
raidr_client ◄── this repo: RaidrClient (HTTP) + useRaidr* query hooks
     │
raidr_lib    (derived state: catalogs, detail classification, snippets)
     │
raidr_app    (web UI, Cloudflare Pages)
```

| Item | Value |
| --- | --- |
| npm name | `@sudobility/raidr_client`, `publishConfig.access: public`, BUSL-1.1 |
| Version | `0.1.4` (`package.json`) |
| Entry points | `.` (client + hooks) and `./network` (client only), per `exports` |
| Runtime dep | `@sudobility/raidr_types` ^0.1.6 |
| Peer deps | `@sudobility/di`, `@sudobility/types`, `@tanstack/react-query` >=5, `react` >=18 |
| Consumers | `raidr_lib` (peer ^0.1.4); `raidr_app` (dep ^0.1.4; `HomePage` calls the hooks directly) |

## Rules

- `src/network/raidr-client.ts`: `createApiConfig` endpoint map and one private
  `request<T>`; the `NetworkClient` is injected, never `fetch` directly.
- `src/hooks/`: one file per resource; every hook signature is
  `(networkClient, baseUrl, ...params, options?)`. Mutations invalidate the list
  key and the affected detail key from `query-keys.ts` (delete hooks *remove*
  the detail key rather than invalidate it).
- Tests use `MockNetworkClient` from `@sudobility/di/mocks` and assert URL,
  method, `X-API-Key` presence, and query encoding.
- Types come only from `@sudobility/raidr_types`; never redefine a wire type.

## Commands

Every command below was run on 2026-09-30 after the documentation pass.

| Command | What it does | Result |
| --- | --- | --- |
| `bun run verify` | lint → typecheck → test:unit → build | exit 0 |
| `bun run check-all` | lint → typecheck → test:unit | exit 0 |
| `bun run lint` | ESLint 9 on `src`; `prettier/prettier` is an error | exit 0 |
| `bun run typecheck` | `tsc --noEmit` (tsconfig excludes `*.test.ts`) | exit 0 |
| `bun run test:unit` (= `test:run`) | Vitest once, happy-dom | 2 files, 12 tests pass (re-run 2026-10-02) |
| `bun run test:coverage` | Vitest + v8 → `coverage/` (gitignored) | exit 0, ~26% lines, no threshold |
| `bun run build` | `tsc -p tsconfig.build.json` → `dist/` (gitignored) | exit 0 |
| `bun run format:check` | Prettier on `src/**/*.ts` | exit 0 |
| `bun run format`, `lint:fix` | rewrite files | not run (they modify files) |
| `test:watch`, `build:watch`, `typecheck:watch` | watch modes | not run |

Single file: `bun run test:unit src/network/__tests__/raidr-client.test.ts`.

## File map

```
src/
├── index.ts                      public API: client, every hook, queryKeys, STALE_TIMES
├── network/
│   ├── index.ts                  `./network` subpath barrel
│   ├── raidr-client.ts           RaidrClient, createRaidrClient, endpoint map, withQuery
│   └── __tests__/raidr-client.test.ts
└── hooks/
    ├── index.ts                  barrel
    ├── query-keys.ts             queryKeys.raidr.* (root ["raidr"])
    ├── query-config.ts           STALE_TIMES
    ├── use-raidr-client.ts       useRaidrClient (memoized RaidrClient)
    ├── use-raidr-health.ts       useRaidrHealth
    ├── use-raidr-mcps.ts         useRaidrMcps / Mcp / UpsertMcp / DeleteMcp
    ├── use-raidr-skills.ts       useRaidrSkills / Skill / UpsertSkill / DeleteSkill
    ├── use-raidr-sites.ts        useRaidrSites / Site / UpsertSite
    ├── use-raidr-crawl.ts        useRaidrSiteMcps / SiteSkills / CrawlJobs / EnqueueCrawlJobs
    ├── use-raidr-apis.ts         useRaidrApis / ApiSummary / ApiDoc / ApiFlow / ExecuteApi, useRaidrSkillByName
    ├── use-raidr-invalidation.ts useRaidrInvalidation (invalidates ["raidr"])
    └── __tests__/query-keys.test.ts
.github/workflows/ci-cd.yml       johnqh/workflows unified-cicd.yml, npm-access public
```

## Endpoints (`createApiConfig`)

| Method(s) | Path | Client methods |
| --- | --- | --- |
| GET | `/` | `getHealth` |
| GET, POST | `/api/v1/mcps` | `getMcps(params)`, `createMcp` |
| GET | `/api/v1/mcps/:apiHost/summary` (public) | `getMcpSummary` |
| GET, PUT, DELETE | `/api/v1/mcps/:apiHost` | `getMcp(apiHost, apiKey?)` (needs auth), `upsertMcp`, `deleteMcp` |
| GET, POST | `/api/v1/skills` | `getSkills(params)`, `createSkill` |
| GET, PUT, DELETE | `/api/v1/skills/:apiHost` | `getSkill`, `upsertSkill`, `deleteSkill` |
| GET | `/api/v1/skills/by-name/:name` | `getSkillByName` (`useRaidrSkillByName`, `retry: false`) |
| GET | `/api/v1/apis` | `getApis(params)` (`useRaidrApis`) |
| GET | `/api/v1/apis/:apiHost/summary` (public) | `getApiSummary` (`useRaidrApiSummary`) |
| GET | `/api/v1/apis/:apiHost` | `getApiDoc(apiHost, apiKey?)` (needs auth; `useRaidrApiDoc`) |
| GET | `/api/v1/apis/:apiHost/flow` | `getApiFlow(apiHost, apiKey?)` (needs auth; `useRaidrApiFlow`) |
| POST | `/api/v1/apis/:apiHost/execute` | `executeApi(apiHost, data, apiKey?)` (needs auth; `useRaidrExecuteApi`) |
| (URL only) | `/api/v1/skills/:apiHost/SKILL.md` | `skillMarkdownUrl` |
| GET, POST | `/api/v1/sites` | `getSites(params)` (adds `apiHost` filter), `createSite` |
| GET, PUT, DELETE | `/api/v1/sites/:origin` | `getSite`, `upsertSite`, `deleteSite` |
| GET | `/api/v1/sites/:origin/mcps` | `getSiteMcps` (`useRaidrSiteMcps`) |
| GET | `/api/v1/sites/:origin/skills` | `getSiteSkills` (`useRaidrSiteSkills`) |
| GET, POST | `/api/v1/crawl-jobs` | `getCrawlJobs(params)` (`useRaidrCrawlJobs`), `enqueueCrawlJobs(apiKey, data)` (`useRaidrEnqueueCrawlJobs`) |
| GET | `/api/v1/crawl-jobs/:id` | `getCrawlJob` |
| (URL only) | `/mcp/:apiHost` (`MCP_PROXY_PATH`) | `mcpProxyUrl` |

- Every path parameter is `encodeURIComponent`-ed. Sites are keyed by full origin
  (`https://www.example.com` → `https%3A%2F%2Fwww.example.com`); a test pins this.
- `withQuery` drops `undefined` and `""`, so an empty search sends no `q`.
- Write methods take the shared write key first and send it as `X-API-Key`
  (`RAIDR_API_KEY_HEADER`). `getMcp` is the one read that needs a credential:
  in a browser the NetworkClient adds the user's Firebase token itself; a
  script passes an entity key (`raidr_…`) as `apiKey`, also sent as
  `X-API-Key`. Anonymous `getMcp` is a 401; anonymous callers use
  `getMcpSummary` / `useRaidrMcpSummary` (query key `mcpSummary(apiHost)`).
  `getApiDoc`, `getApiFlow` and `executeApi` follow the same rule; anonymous
  callers use `getApiSummary`. The execute body carries the upstream
  `userToken` / `apiKey`, which raidr_api never stores.
- Entity, member, invitation and entity-API-key endpoints are not here: the
  app uses `@sudobility/entity_client` against the same base URL. Trailing slashes on the base URL
  are stripped.

## Conventions

**Hook signatures.** Queries: `(networkClient, baseUrl, params | id, options?)`,
`options` = `Omit<UseQueryOptions<T>, "queryKey" | "queryFn">`, spread *after*
the defaults so callers can override `staleTime` and `retry`. Mutations:
`(networkClient, baseUrl)` with variables `{ token, apiHost | origin, data? }`.
Every hook builds its client through `useRaidrClient`, memoized on
`[networkClient, baseUrl]`, so pass a stable NetworkClient.

**Query keys** (`query-keys.ts`, all under `["raidr"]`):

| Key | Shape | Used by |
| --- | --- | --- |
| `all()` | `["raidr"]` | `useRaidrInvalidation` |
| `health()` | `["raidr","health"]` | `useRaidrHealth` |
| `mcps(f?)`, `skills(f?)`, `sites(f?)` | `["raidr","mcps",f]`; no `f` → 2-element prefix | list hooks pass `params ?? {}`; mutations invalidate the prefix |
| `mcp(h)`, `skill(h)`, `site(o)` | `["raidr","mcp",h]` | detail hooks; mutations |
| `apis(f?)` | `["raidr","apis",f]` | `useRaidrApis` |
| `apiDoc(h)`, `apiFlow(h)`, `apiSummary(h)` | `["raidr","api-doc",h]` etc. | the API doc hooks |
| `skillByName(n)` | `["raidr","skill-by-name",n]` | `useRaidrSkillByName` |

**Stale times** (`STALE_TIMES`): `HEALTH` 1 min, `CATALOG` 5 min, `DETAIL` 10 min.
The catalog only changes when a crawl publishes.

**Enabled and retry.**
- `useRaidrMcp`, `useRaidrSkill`, `useRaidrSite` set
  `enabled: id.length > 0 && (options?.enabled ?? true)` after the spread, so an
  empty route param never fires a request.
- `useRaidrSkill` defaults `retry: false` (a missing skill is normal for an MCP).
  `useRaidrMcp` and `useRaidrSite` keep TanStack's default; raidr_lib passes `retry: false`.
- `useRaidrApiSummary`, `useRaidrApiDoc`, `useRaidrApiFlow` and
  `useRaidrSkillByName` gate on a non-empty id the same way. Pass
  `enabled: false` to `useRaidrApiDoc` / `useRaidrApiFlow` while signed out
  (the API answers 401).
- `useRaidrExecuteApi` is a mutation with variables `{ apiHost, data, apiKey? }`
  and invalidates nothing: every run is a fresh upstream call, never cached.

**Error handling.** The client catches nothing. The web NetworkClient in
`@sudobility/di` throws `NetworkError` (`@sudobility/types`) whose `.status` is
the HTTP status for a non-2xx, `0` when the API is unreachable, `408` on timeout.
The rejection lands in the query's `error`; raidr_lib's `isNotFoundError` and
`detailState` turn a 404 into "not found" and anything else into an error state.

## How to add an endpoint, end to end

1. `raidr_types`: add the request/response types (never define them here).
2. Here: add the path to `createApiConfig().ENDPOINTS`, a `RaidrClient` method
   that calls `this.request`, a key in `queryKeys.raidr`, and a hook in the
   matching `use-raidr-*.ts` following the signatures above.
3. Export the hook from `src/hooks/index.ts` **and** `src/index.ts`.
4. Test it in `src/network/__tests__/` with `MockNetworkClient`
   (`setMockResponse(url, { data }, method)`, then `getRequests().at(-1)`).
5. `bun run verify`. Then wrap it in raidr_lib and render it in raidr_app
   (their CLAUDE.md files continue the steps).

## Release

- The family release runs from `raidr_app/scripts/push_all.sh`, in this order
  (`path:wait`): `raidr_types:60 → raidr_processor:60 → raidr_client:60 →
  raidr_lib:60 → raidr_cli:180 → raidr_crawler:0 → raidr_extension:0 → raidr_api:0 →
  raidr_app:0 → raidr_web:0`. The sourced `workflows/scripts/push_projects.sh`
  polls npm for each new version and moves on once it is served; the number is
  only a cap. Per repo it updates `@sudobility` deps, validates, bumps the patch
  version, commits and pushes. Never run it unasked.
- A push to `main` runs `.github/workflows/ci-cd.yml` → `unified-cicd.yml`:
  typecheck, lint, `test:unit`, build, then `npm publish` only when this version
  is not on npm yet.
- 0.x caret ranges: `^0.1.0` accepts any `0.1.x`, so a patch release reaches
  raidr_lib and raidr_app on their next install without a range change.

## Gotchas

- **JSDoc is stripped from the published `.d.ts`.** `tsconfig.json` sets
  `removeComments: true` and `tsconfig.build.json` does not override it
  (raidr_lib does). The comments help in-repo readers only.
- No site delete hook, although `RaidrClient.deleteSite` exists; `createMcp`,
  `createSkill` and `createSite` have no hooks either.
- `RaidrClient` methods return `response.data` cast to `T`; nothing is validated
  at runtime.
- Lint runs Prettier as an ESLint rule (double quotes, trailing commas `all`,
  width 80), so a badly wrapped comment fails `bun run lint`.
- Tests live in `__tests__/`, excluded from `tsconfig.json` and the build; only
  Vitest and ESLint see them.
