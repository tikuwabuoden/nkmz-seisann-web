import { sampleExpenses, sampleGroup } from "@/domain/test-data";
import { createMockExpenseClient } from "@/features/expenses/expense-client";

describe("費目のモッククライアント", () => {
  it("指定した精算グループの費目だけを取得できる", async () => {
    const anotherGroupExpense = { ...sampleExpenses[1], groupId: "group-another" };
    const client = createMockExpenseClient([sampleExpenses[0], anotherGroupExpense]);

    await expect(client.list(sampleGroup.id)).resolves.toEqual([sampleExpenses[0]]);
  });
});
