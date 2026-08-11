import { describe, expect, it } from "vitest";

import type { Participant } from "@/domain/types";

import { calculateExpenseAllocation } from "./expense-allocation";

const participants: Participant[] = [
  { id: "alice", userId: "user-alice", username: "あきら", active: true, joinedAt: "2026-07-01T09:00:00Z" },
  { id: "bob", userId: "user-bob", username: "ゆう", active: true, joinedAt: "2026-07-01T09:01:00Z" },
  { id: "carol", userId: "user-carol", username: "さき", active: true, joinedAt: "2026-07-01T09:02:00Z" },
];

describe("分担額計算", () => {
  it("立替者以外を優先して端数を配分する", () => {
    expect(calculateExpenseAllocation({
      amount: 1_000,
      payerId: "alice",
      participants,
      shares: [
        { participantId: "alice", weight: 100 },
        { participantId: "bob", weight: 100 },
        { participantId: "carol", weight: 100 },
      ],
    })).toEqual([
      { participantId: "alice", allocatedAmount: 333 },
      { participantId: "bob", allocatedAmount: 334 },
      { participantId: "carol", allocatedAmount: 333 },
    ]);
  });

  it("立替者だけが負担する場合は立替者へ端数を配分する", () => {
    expect(calculateExpenseAllocation({
      amount: 1_001,
      payerId: "alice",
      participants,
      shares: [{ participantId: "alice", weight: 100 }],
    })).toEqual([{ participantId: "alice", allocatedAmount: 1_001 }]);
  });

  it("小数第2位までを整数重みとして正確に配分する", () => {
    expect(calculateExpenseAllocation({
      amount: 1_000,
      payerId: "alice",
      participants,
      shares: [
        { participantId: "alice", weight: 125 },
        { participantId: "bob", weight: 50 },
      ],
    })).toEqual([
      { participantId: "alice", allocatedAmount: 714 },
      { participantId: "bob", allocatedAmount: 286 },
    ]);
  });

  it("重みが0の参加者には0円を配分する", () => {
    expect(calculateExpenseAllocation({
      amount: 100,
      payerId: "alice",
      participants,
      shares: [
        { participantId: "alice", weight: 100 },
        { participantId: "bob", weight: 0 },
        { participantId: "carol", weight: 100 },
      ],
    })).toEqual([
      { participantId: "alice", allocatedAmount: 50 },
      { participantId: "bob", allocatedAmount: 0 },
      { participantId: "carol", allocatedAmount: 50 },
    ]);
  });

  it("負担者の入力順ではなく精算グループへの参加順で端数を配分する", () => {
    expect(calculateExpenseAllocation({
      amount: 1_000,
      payerId: "alice",
      participants,
      shares: [
        { participantId: "carol", weight: 100 },
        { participantId: "bob", weight: 100 },
        { participantId: "alice", weight: 100 },
      ],
    })).toEqual([
      { participantId: "carol", allocatedAmount: 333 },
      { participantId: "bob", allocatedAmount: 334 },
      { participantId: "alice", allocatedAmount: 333 },
    ]);
  });

  it("総額が1円でも端数を優先順位に従って配分し、合計を一致させる", () => {
    const allocations = calculateExpenseAllocation({
      amount: 1,
      payerId: "alice",
      participants,
      shares: [
        { participantId: "alice", weight: 100 },
        { participantId: "bob", weight: 100 },
        { participantId: "carol", weight: 100 },
      ],
    });

    expect(allocations).toEqual([
      { participantId: "alice", allocatedAmount: 0 },
      { participantId: "bob", allocatedAmount: 1 },
      { participantId: "carol", allocatedAmount: 0 },
    ]);
    expect(allocations.reduce((total, allocation) => total + allocation.allocatedAmount, 0)).toBe(1);
  });

  it("重みの合計が大きい場合でも配分額の合計を総額と一致させる", () => {
    const allocations = calculateExpenseAllocation({
      amount: 9_999_999,
      payerId: "alice",
      participants,
      shares: [
        { participantId: "alice", weight: 9_999_999 },
        { participantId: "bob", weight: 1 },
        { participantId: "carol", weight: 1 },
      ],
    });

    expect(allocations.reduce((total, allocation) => total + allocation.allocatedAmount, 0)).toBe(9_999_999);
  });

  it("重みがすべて0の場合は計算できない", () => {
    expect(() => calculateExpenseAllocation({
      amount: 100,
      payerId: "alice",
      participants,
      shares: [
        { participantId: "alice", weight: 0 },
        { participantId: "bob", weight: 0 },
      ],
    })).toThrow("重みが0より大きい負担者を1人以上指定してください。");
  });
});
