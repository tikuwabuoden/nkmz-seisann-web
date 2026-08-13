import { describe, expect, it } from "vitest";

import { createMockGroupClient } from "./group-client";

describe("グループのモッククライアント", () => {
  it("作成したグループを一覧へ反映する", async () => {
    const client = createMockGroupClient([]);

    const createdGroup = await client.create({ name: "夏合宿" });

    await expect(client.list()).resolves.toEqual([createdGroup]);
  });
});
