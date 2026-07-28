import type { Expense, ExpenseGroup, NkmzUser, Settlement } from "@/domain/types";

export const users = {
  alice: { id: "user-alice", username: "alice" },
  bob: { id: "user-bob", username: "bob" },
  carol: { id: "user-carol", username: "carol" },
  dave: { id: "user-dave", username: "dave" },
} as const satisfies Record<string, NkmzUser>;

export const sampleGroup: ExpenseGroup = {
  id: "group-tokyo-2026",
  name: "Tokyo weekend",
  archivedAt: null,
  createdAt: "2026-07-01T09:00:00Z",
  updatedAt: "2026-07-03T12:00:00Z",
  participants: [
    { id: "participant-alice", user: users.alice, status: "active", joinedAt: "2026-07-01T09:00:00Z" },
    { id: "participant-bob", user: users.bob, status: "active", joinedAt: "2026-07-01T09:01:00Z" },
    { id: "participant-carol", user: users.carol, status: "active", joinedAt: "2026-07-01T09:02:00Z" },
    { id: "participant-dave", user: users.dave, status: "inactive", joinedAt: "2026-07-01T09:03:00Z" },
  ],
};

export const sampleExpenses: Expense[] = [
  {
    id: "expense-rail",
    groupId: sampleGroup.id,
    description: "Rail tickets",
    amount: 4_800,
    memo: null,
    paidBy: [{ participantId: "participant-alice", amount: 4_800 }],
    burdenShares: [
      { participantId: "participant-alice", weight: 100 },
      { participantId: "participant-bob", weight: 100 },
      { participantId: "participant-carol", weight: 100 },
    ],
    createdAt: "2026-07-01T10:00:00Z",
    updatedAt: "2026-07-01T10:00:00Z",
  },
  {
    id: "expense-hotel",
    groupId: sampleGroup.id,
    description: "Hotel",
    amount: 9_000,
    memo: "Two payers",
    paidBy: [
      { participantId: "participant-bob", amount: 4_000 },
      { participantId: "participant-carol", amount: 5_000 },
    ],
    burdenShares: [
      { participantId: "participant-alice", weight: 100 },
      { participantId: "participant-bob", weight: 150 },
      { participantId: "participant-carol", weight: 75 },
    ],
    createdAt: "2026-07-02T14:00:00Z",
    updatedAt: "2026-07-02T14:00:00Z",
  },
  {
    id: "expense-snacks",
    groupId: sampleGroup.id,
    description: "Snacks",
    amount: 1_000,
    memo: "Includes a zero weight",
    paidBy: [{ participantId: "participant-alice", amount: 1_000 }],
    burdenShares: [
      { participantId: "participant-alice", weight: 125 },
      { participantId: "participant-bob", weight: 0 },
      { participantId: "participant-carol", weight: 50 },
    ],
    createdAt: "2026-07-03T11:00:00Z",
    updatedAt: "2026-07-03T11:00:00Z",
  },
];

export const sampleSettlement: Settlement = {
  groupId: sampleGroup.id,
  calculatedAt: "2026-07-03T12:00:00Z",
  participantSummaries: [
    { participantId: "participant-alice", paidAmount: 5_800, burdenAmount: 5_036, balance: 764 },
    { participantId: "participant-bob", paidAmount: 4_000, burdenAmount: 5_754, balance: -1_754 },
    { participantId: "participant-carol", paidAmount: 5_000, burdenAmount: 4_010, balance: 990 },
    { participantId: "participant-dave", paidAmount: 0, burdenAmount: 0, balance: 0 },
  ],
  transfers: [
    { fromParticipantId: "participant-bob", toParticipantId: "participant-alice", amount: 764 },
    { fromParticipantId: "participant-bob", toParticipantId: "participant-carol", amount: 990 },
  ],
};

export const emptyGroup: ExpenseGroup = {
  id: "group-empty",
  name: "New trip",
  archivedAt: null,
  createdAt: "2026-07-04T09:00:00Z",
  updatedAt: "2026-07-04T09:00:00Z",
  participants: [
    { id: "participant-alice-empty", user: users.alice, status: "active", joinedAt: "2026-07-04T09:00:00Z" },
  ],
};
