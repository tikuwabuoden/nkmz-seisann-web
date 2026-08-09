import { describe, expect, it } from "vitest";

import { createMockGroupClient } from "@/features/groups/group-client";

describe("精算グループのモッククライアント", () => {
  it("作成したグループを一覧で取得できる", async () => {
    const client = createMockGroupClient([]);

    const createdGroup = await client.create({ name: "夏合宿" });

    expect(createdGroup).toMatchObject({
      name: "夏合宿",
      participantCount: 1,
      expenseCount: 0,
    });
    await expect(client.list()).resolves.toEqual([createdGroup]);
  });
});
