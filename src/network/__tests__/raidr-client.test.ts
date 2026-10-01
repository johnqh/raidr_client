import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { MockNetworkClient } from "@sudobility/di/mocks";
import { createRaidrClient, RaidrClient } from "../raidr-client";

const BASE_URL = "https://api.raidr.test";
const KEY = "write-key";

describe("RaidrClient", () => {
  let client: RaidrClient;
  let network: MockNetworkClient;

  beforeEach(() => {
    network = new MockNetworkClient();
    client = createRaidrClient(network, `${BASE_URL}/`);
  });

  afterEach(() => {
    network.reset();
  });

  it("GETs the catalog with query params and no api key", async () => {
    const url = `${BASE_URL}/api/v1/mcps?q=example&limit=10&offset=20`;
    network.setMockResponse(url, { data: { success: true, data: [] } }, "GET");
    await client.getMcps({ q: "example", limit: 10, offset: 20 });
    const call = network.getRequests().at(-1)!;
    expect(call.url).toBe(url);
    expect(call.options?.headers?.["X-API-Key"]).toBeUndefined();
  });

  it("PUTs with the api key header", async () => {
    const url = `${BASE_URL}/api/v1/skills/api.example.com`;
    network.setMockResponse(url, { data: { success: true } }, "PUT");
    await client.upsertSkill(KEY, "api.example.com", {
      name: "x",
      markdown: "y",
    });
    const call = network.getRequests().at(-1)!;
    expect(call.method).toBe("PUT");
    expect(call.options?.headers?.["X-API-Key"]).toBe(KEY);
    expect(JSON.parse(call.body as string)).toEqual({
      name: "x",
      markdown: "y",
    });
  });

  it("encodes the origin in site paths", async () => {
    const url = `${BASE_URL}/api/v1/sites/https%3A%2F%2Fwww.example.com`;
    network.setMockResponse(url, { data: { success: true } }, "GET");
    await client.getSite("https://www.example.com");
    expect(network.getRequests().at(-1)!.url).toBe(url);
  });

  it("builds documentation urls without a request", () => {
    expect(client.skillMarkdownUrl("api.example.com")).toBe(
      `${BASE_URL}/api/v1/skills/api.example.com/SKILL.md`,
    );
    expect(client.mcpProxyUrl("api.example.com")).toBe(
      `${BASE_URL}/mcp/api.example.com`,
    );
    expect(network.getRequests()).toHaveLength(0);
  });
});

describe("RaidrClient MCP auth", () => {
  it("fetches the public summary without credentials", async () => {
    const network = new MockNetworkClient();
    const client = createRaidrClient(network, BASE_URL);
    const url = `${BASE_URL}/api/v1/mcps/api.example.com/summary`;
    network.setMockResponse(url, { data: { success: true } }, "GET");
    await client.getMcpSummary("api.example.com");
    const call = network.getRequests().at(-1)!;
    expect(call.url).toBe(url);
    expect(call.options?.headers?.["X-API-Key"]).toBeUndefined();
  });

  it("sends an entity API key on the full manifest when given one", async () => {
    const network = new MockNetworkClient();
    const client = createRaidrClient(network, BASE_URL);
    const url = `${BASE_URL}/api/v1/mcps/api.example.com`;
    network.setMockResponse(url, { data: { success: true } }, "GET");
    await client.getMcp("api.example.com", "raidr_abc");
    expect(network.getRequests().at(-1)!.options?.headers?.["X-API-Key"]).toBe(
      "raidr_abc",
    );
    await client.getMcp("api.example.com");
    expect(
      network.getRequests().at(-1)!.options?.headers?.["X-API-Key"],
    ).toBeUndefined();
  });
});

describe("RaidrClient crawl queue and site associations", () => {
  it("reads a site's MCP servers and skills with the origin encoded", async () => {
    const network = new MockNetworkClient();
    const client = createRaidrClient(network, BASE_URL);
    const mcps = `${BASE_URL}/api/v1/sites/https%3A%2F%2Fsuno.com/mcps`;
    const skills = `${BASE_URL}/api/v1/sites/https%3A%2F%2Fsuno.com/skills`;
    network.setMockResponse(mcps, { data: { success: true, data: [] } }, "GET");
    network.setMockResponse(
      skills,
      { data: { success: true, data: [] } },
      "GET",
    );
    await client.getSiteMcps("https://suno.com");
    expect(network.getRequests().at(-1)!.url).toBe(mcps);
    await client.getSiteSkills("https://suno.com");
    expect(network.getRequests().at(-1)!.url).toBe(skills);
  });

  it("lists the queue publicly and enqueues with the write key", async () => {
    const network = new MockNetworkClient();
    const client = createRaidrClient(network, BASE_URL);
    const list = `${BASE_URL}/api/v1/crawl-jobs?status=queued&limit=5`;
    network.setMockResponse(list, { data: { success: true, data: [] } }, "GET");
    await client.getCrawlJobs({ status: "queued", limit: 5 });
    expect(
      network.getRequests().at(-1)!.options?.headers?.["X-API-Key"],
    ).toBeUndefined();

    const post = `${BASE_URL}/api/v1/crawl-jobs`;
    network.setMockResponse(
      post,
      { data: { success: true, data: [] } },
      "POST",
    );
    await client.enqueueCrawlJobs(KEY, {
      origins: ["https://suno.com"],
      force: true,
    });
    const call = network.getRequests().at(-1)!;
    expect(call.method).toBe("POST");
    expect(call.options?.headers?.["X-API-Key"]).toBe(KEY);
    expect(JSON.parse(call.body as string)).toEqual({
      origins: ["https://suno.com"],
      force: true,
    });
  });
});
