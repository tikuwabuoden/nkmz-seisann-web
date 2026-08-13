import { describe, expect, it } from "vitest";

import { emptyGroup, emptySettlement, sampleGroup, sampleSettlement } from "@/domain/test-data";
import { ApiError } from "@/lib/api-client";
import { createMockSettlementClient } from "./settlement-client";

describe("精算結果のモッククライアント", () => {
  it("精算グループごとの精算結果を取得できる", async () => {
    const client = createMockSettlementClient({ [sampleGroup.id]: sampleSettlement, [emptyGroup.id]: emptySettlement });
    await expect(client.get(sampleGroup.id)).resolves.toEqual(sampleSettlement);
    await expect(client.get(emptyGroup.id)).resolves.toEqual(emptySettlement);
  });

  it("存在しない精算グループでは404エラーを返す", async () => {
    await expect(createMockSettlementClient().get("group-unknown")).rejects.toEqual(new ApiError(404, "Not Found"));
  });
});
