import { emptySettlement, sampleExpenses, sampleGroup, sampleSettlement } from "@/domain/test-data";

describe("ドメインの固定データ", () => {
  it("各費目の立替額合計が整数円の総額と一致する", () => {
    for (const expense of sampleExpenses) {
      const paidTotal = expense.paidBy.reduce((total, payment) => total + payment.amount, 0);

      expect(paidTotal).toBe(expense.amount);
    }
  });

  it("無効参加者、重み0、小数第2位の重みを含む", () => {
    expect(sampleGroup.participants).toContainEqual(
      expect.objectContaining({ status: "inactive" }),
    );
    expect(sampleExpenses.flatMap((expense) => expense.burdenShares)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ weight: 0 }),
        expect.objectContaining({ weight: 125 }),
      ]),
    );
  });

  it("精算差額と送金案の合計が整合する", () => {
    const balances = sampleSettlement.participantSummaries.reduce(
      (total, participant) => total + participant.balance,
      0,
    );
    const transferTotal = sampleSettlement.transfers.reduce(
      (total, transfer) => total + transfer.amount,
      0,
    );

    expect(balances).toBe(0);
    expect(transferTotal).toBe(1_754);
  });

  it("費目がない場合は精算計算日時を持たない", () => {
    expect(emptySettlement.calculatedAt).toBeNull();
  });
});
