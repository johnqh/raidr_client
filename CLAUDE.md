# CLAUDE.md — raidr_client

Network client + TanStack Query hooks for `raidr_api`. Published as
`@sudobility/raidr_client` (public). Bun only. Mirrors `sudojo_client`.

- `src/network/raidr-client.ts`: `createApiConfig` endpoint map and one private
  `request<T>`; the `NetworkClient` is injected, never `fetch` directly.
- `src/hooks/`: one file per resource; every hook signature is
  `(networkClient, baseUrl, ...params, options?)`. Mutations invalidate the list
  key and the affected detail key from `query-keys.ts`.
- Tests use `MockNetworkClient` from `@sudobility/di/mocks` and assert URL,
  method, `X-API-Key` presence, and query encoding.
- Types come only from `@sudobility/raidr_types`; never redefine a wire type.

```bash
bun run verify   # lint, typecheck, test, build
```
