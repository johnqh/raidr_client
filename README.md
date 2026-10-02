# raidr_client

TypeScript client and TanStack Query hooks for the raidr API.

```bash
bun add @sudobility/raidr_client
```

```ts
import { createRaidrClient, useRaidrMcps } from '@sudobility/raidr_client';

const client = createRaidrClient(networkClient, 'https://api.raidr.app');
const { data } = await client.getMcps({ q: 'example' });
```

Every hook takes `(networkClient, baseUrl, ...)` so web, native and tests share
one code path; the `NetworkClient` comes from `@sudobility/di`. Reads are
public. Mutations take the shared write key as `token` and send it as
`X-API-Key`.

| Export | Purpose |
| --- | --- |
| `RaidrClient` | `getMcps`, `getMcp`, `getSkills`, `getSkill`, `getSkillByName`, `getSites`, `getSite`, `getApis`, `getApiSummary`, `getApiDoc`, `getApiFlow`, `executeApi`, `upsert*`, `delete*`, `skillMarkdownUrl`, `mcpProxyUrl` |
| `useRaidrMcps` / `useRaidrMcp` | catalog and detail queries |
| `useRaidrSkills` / `useRaidrSkill` | same for skills |
| `useRaidrSites` / `useRaidrSite` | same for sites, with an `apiHost` filter |
| `useRaidrApis` / `useRaidrApiSummary` / `useRaidrApiDoc` / `useRaidrApiFlow` | API docs: list, public summary, full doc and flow links (doc and flow need a signed-in user or entity key) |
| `useRaidrExecuteApi` | run one endpoint through raidr_api's execute proxy (mutation) |
| `useRaidrSkillByName` | one skill by its slug |
| `queryKeys`, `STALE_TIMES` | cache keys rooted at `["raidr"]` |
