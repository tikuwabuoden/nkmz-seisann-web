import { describe, expect, it } from "vitest";

import { sampleExpenses, sampleGroup } from "@/domain/test-data";
import { createMockExpenseClient } from "./expense-client";

describe("費目のモッククライアント", () => {
  it("指定した精算グループの費目だけを取得できる", async () => {
    const client = createMockExpenseClient({ [sampleGroup.id]: [sampleExpenses[0]], "group-another": [sampleExpenses[1]] });
    await expect(client.list(sampleGroup.id)).resolves.toEqual([sampleExpenses[0]]);
  });

  it("費目を更新し、更新後の値を取得できる", async () => {
    const client = createMockExpenseClient({ [sampleGroup.id]: [sampleExpenses[0]] });
    const input = { description: "更新後の費目", amount: 12_000, note: null, payers: [{ participantId: sampleExpenses[0].payers[0].participantId, amount: 12_000 }], shares: sampleExpenses[0].shares.map((share) => ({ participantId: share.participantId, weight: share.weight })) };
    await expect(client.update(sampleGroup.id, sampleExpenses[0].id, input)).resolves.toMatchObject({ description: "更新後の費目", amount: 12_000, note: null });
    await expect(client.get(sampleGroup.id, sampleExpenses[0].id)).resolves.toMatchObject({ description: "更新後の費目", amount: 12_000 });
  });
});
