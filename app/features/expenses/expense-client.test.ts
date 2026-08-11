import { sampleExpenses, sampleGroup } from "@/domain/test-data";
import { createMockExpenseClient } from "@/features/expenses/expense-client";

describe("費目のモッククライアント", () => {
  it("指定した精算グループの費目だけを取得できる", async () => {
    const client = createMockExpenseClient({
      [sampleGroup.id]: [sampleExpenses[0]],
      "group-another": [sampleExpenses[1]],
    });

    await expect(client.list(sampleGroup.id)).resolves.toEqual([sampleExpenses[0]]);
  });
});
