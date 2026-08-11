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
