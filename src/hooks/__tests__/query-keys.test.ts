import { describe, expect, it } from "vitest";
import { queryKeys } from "../query-keys";

describe("queryKeys", () => {
  it("nests under the raidr root", () => {
    expect(queryKeys.raidr.all()).toEqual(["raidr"]);
    expect(queryKeys.raidr.mcps({ q: "x" })).toEqual(["raidr", "mcps", { q: "x" }]);
    expect(queryKeys.raidr.mcp("api.example.com")).toEqual(["raidr", "mcp", "api.example.com"]);
    expect(queryKeys.raidr.sites()).toEqual(["raidr", "sites"]);
  });
});
