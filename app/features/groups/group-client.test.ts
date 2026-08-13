import { describe, expect, it, vi } from "vitest";

import { type ApiClient } from "@/lib/api-client";

import { createNkmzGroupClient } from "./group-client";

describe("グループの実 API クライアント", () => {
  it("実 API からグループ、参加者数、費目数を取得する", async () => {
    const request = vi.fn(async (path: string) => {
      if (path.endsWith("/expense-groups")) {
        return { items: [{ id: "group-1", name: "夏合宿" }], nextCursor: null };
      }
      if (path.endsWith("/expense-groups/group-1/participants")) {
        return [{ id: "participant-1" }, { id: "participant-2" }];
      }
      if (path.includes("/expense-groups/group-1/expenses")) {
        return { items: [{ id: "expense-1" }, { id: "expense-2" }], nextCursor: null };
      }
      throw new Error(`Unexpected path: ${path}`);
    });
    const client = createNkmzGroupClient({ request: request as ApiClient["request"] });

    await expect(client.list()).resolves.toEqual([
      { id: "group-1", name: "夏合宿", participantCount: 2, expenseCount: 2 },
    ]);
  });

  it("費目一覧の次ページも取得して件数に含める", async () => {
    const request = vi.fn(async (path: string) => {
      if (path.endsWith("/expense-groups")) return { items: [{ id: "group-1", name: "夏合宿" }], nextCursor: null };
      if (path.endsWith("/expense-groups/group-1/participants")) return [];
      if (path.includes("cursor=next")) return { items: [{ id: "expense-3" }], nextCursor: null };
      if (path.includes("/expense-groups/group-1/expenses")) {
        return { items: [{ id: "expense-1" }, { id: "expense-2" }], nextCursor: "next" };
      }
      throw new Error(`Unexpected path: ${path}`);
    });
    const client = createNkmzGroupClient({ request: request as ApiClient["request"] });

    await expect(client.list()).resolves.toEqual([
      { id: "group-1", name: "夏合宿", participantCount: 0, expenseCount: 3 },
    ]);
  });

});
