import { sampleExpenses, sampleGroup, sampleSettlement } from "@/domain/test-data";

describe("sample domain data", () => {
  it("keeps each expense's payer total equal to its JPY amount", () => {
    for (const expense of sampleExpenses) {
      const paidTotal = expense.paidBy.reduce((total, payment) => total + payment.amount, 0);

      expect(paidTotal).toBe(expense.amount);
    }
  });

  it("includes inactive participants, zero weights, and hundredth weights", () => {
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

  it("balances the settlement and its transfer plan", () => {
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
});
