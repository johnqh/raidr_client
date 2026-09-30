import type { NetworkClient } from "@sudobility/types";
import {
  type BaseResponse,
  type HealthCheckData,
  type ListQueryParams,
  type Mcp,
  MCP_PROXY_PATH,
  type McpSummary,
  type McpUpsertRequest,
  type PaginatedResponse,
  RAIDR_API_KEY_HEADER,
  type Site,
  type SiteCreateRequest,
  type SiteListQueryParams,
  type SiteUpsertRequest,
  type Skill,
  type SkillCreateRequest,
  type SkillSummary,
  type SkillUpsertRequest,
} from "@sudobility/raidr_types";

// =============================================================================
// API configuration
// =============================================================================

const createApiConfig = (baseUrl: string) => ({
  BASE_URL: baseUrl.replace(/\/+$/, ""),
  ENDPOINTS: {
    HEALTH: "/",
    MCPS: "/api/v1/mcps",
    MCP: (apiHost: string) => `/api/v1/mcps/${encodeURIComponent(apiHost)}`,
    SKILLS: "/api/v1/skills",
    SKILL: (apiHost: string) => `/api/v1/skills/${encodeURIComponent(apiHost)}`,
    SKILL_MARKDOWN: (apiHost: string) =>
      `/api/v1/skills/${encodeURIComponent(apiHost)}/SKILL.md`,
    SITES: "/api/v1/sites",
    SITE: (origin: string) => `/api/v1/sites/${encodeURIComponent(origin)}`,
    MCP_PROXY: (apiHost: string) =>
      `${MCP_PROXY_PATH}/${encodeURIComponent(apiHost)}`,
  },
  DEFAULT_HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

type QueryValue = string | number | boolean | undefined;

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  /** Shared write key; sent as X-API-Key. Never needed for GET. */
  apiKey?: string;
  query?: Record<string, QueryValue>;
  timeout?: number;
}

function withQuery(path: string, query?: Record<string, QueryValue>): string {
  if (!query) return path;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  const encoded = params.toString();
  return encoded ? `${path}?${encoded}` : path;
}

// =============================================================================
// Client
// =============================================================================

/**
 * HTTP client for raidr_api. Reads are public; writes take the shared API key.
 * The NetworkClient is injected so web, native and tests share one code path.
 */
export class RaidrClient {
  private readonly config: ReturnType<typeof createApiConfig>;

  constructor(
    private readonly networkClient: NetworkClient,
    baseUrl: string,
  ) {
    this.config = createApiConfig(baseUrl);
  }

  /** Absolute URL of the raw SKILL.md for an API host. */
  skillMarkdownUrl(apiHost: string): string {
    return `${this.config.BASE_URL}${this.config.ENDPOINTS.SKILL_MARKDOWN(apiHost)}`;
  }

  /** Absolute URL of the hosted MCP endpoint for an API host. */
  mcpProxyUrl(apiHost: string): string {
    return `${this.config.BASE_URL}${this.config.ENDPOINTS.MCP_PROXY(apiHost)}`;
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const { method = "GET", body, apiKey, query, timeout } = options;
    const headers: Record<string, string> = { ...this.config.DEFAULT_HEADERS };
    if (apiKey) headers[RAIDR_API_KEY_HEADER] = apiKey;

    const response = await this.networkClient.request<T>(
      `${this.config.BASE_URL}${withQuery(endpoint, query)}`,
      {
        method,
        headers,
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
        ...(timeout !== undefined ? { timeout } : {}),
      },
    );
    return response.data as T;
  }

  // ---- Health ----

  getHealth(): Promise<BaseResponse<HealthCheckData>> {
    return this.request(this.config.ENDPOINTS.HEALTH);
  }

  // ---- MCPs ----

  getMcps(params?: ListQueryParams): Promise<PaginatedResponse<McpSummary>> {
    return this.request(this.config.ENDPOINTS.MCPS, { query: { ...params } });
  }

  getMcp(apiHost: string): Promise<BaseResponse<Mcp>> {
    return this.request(this.config.ENDPOINTS.MCP(apiHost));
  }

  createMcp(
    apiKey: string,
    data: McpUpsertRequest,
  ): Promise<BaseResponse<Mcp>> {
    return this.request(this.config.ENDPOINTS.MCPS, {
      method: "POST",
      body: data,
      apiKey,
    });
  }

  upsertMcp(
    apiKey: string,
    apiHost: string,
    data: McpUpsertRequest,
  ): Promise<BaseResponse<Mcp>> {
    return this.request(this.config.ENDPOINTS.MCP(apiHost), {
      method: "PUT",
      body: data,
      apiKey,
    });
  }

  deleteMcp(apiKey: string, apiHost: string): Promise<BaseResponse<Mcp>> {
    return this.request(this.config.ENDPOINTS.MCP(apiHost), {
      method: "DELETE",
      apiKey,
    });
  }

  // ---- Skills ----

  getSkills(
    params?: ListQueryParams,
  ): Promise<PaginatedResponse<SkillSummary>> {
    return this.request(this.config.ENDPOINTS.SKILLS, {
      query: { ...params },
    });
  }

  getSkill(apiHost: string): Promise<BaseResponse<Skill>> {
    return this.request(this.config.ENDPOINTS.SKILL(apiHost));
  }

  createSkill(
    apiKey: string,
    data: SkillCreateRequest,
  ): Promise<BaseResponse<Skill>> {
    return this.request(this.config.ENDPOINTS.SKILLS, {
      method: "POST",
      body: data,
      apiKey,
    });
  }

  upsertSkill(
    apiKey: string,
    apiHost: string,
    data: SkillUpsertRequest,
  ): Promise<BaseResponse<Skill>> {
    return this.request(this.config.ENDPOINTS.SKILL(apiHost), {
      method: "PUT",
      body: data,
      apiKey,
    });
  }

  deleteSkill(apiKey: string, apiHost: string): Promise<BaseResponse<Skill>> {
    return this.request(this.config.ENDPOINTS.SKILL(apiHost), {
      method: "DELETE",
      apiKey,
    });
  }

  // ---- Sites ----

  getSites(params?: SiteListQueryParams): Promise<PaginatedResponse<Site>> {
    return this.request(this.config.ENDPOINTS.SITES, { query: { ...params } });
  }

  getSite(origin: string): Promise<BaseResponse<Site>> {
    return this.request(this.config.ENDPOINTS.SITE(origin));
  }

  createSite(
    apiKey: string,
    data: SiteCreateRequest,
  ): Promise<BaseResponse<Site>> {
    return this.request(this.config.ENDPOINTS.SITES, {
      method: "POST",
      body: data,
      apiKey,
    });
  }

  upsertSite(
    apiKey: string,
    origin: string,
    data: SiteUpsertRequest,
  ): Promise<BaseResponse<Site>> {
    return this.request(this.config.ENDPOINTS.SITE(origin), {
      method: "PUT",
      body: data,
      apiKey,
    });
  }

  deleteSite(apiKey: string, origin: string): Promise<BaseResponse<Site>> {
    return this.request(this.config.ENDPOINTS.SITE(origin), {
      method: "DELETE",
      apiKey,
    });
  }
}

export const createRaidrClient = (
  networkClient: NetworkClient,
  baseUrl: string,
): RaidrClient => new RaidrClient(networkClient, baseUrl);
