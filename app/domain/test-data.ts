import type { Expense, ExpenseGroup, NkmzUser, Settlement } from "@/domain/types";

export const users = {
  alice: { id: "user-alice", username: "akira" },
  bob: { id: "user-bob", username: "yu" },
  carol: { id: "user-carol", username: "saki" },
  dave: { id: "user-dave", username: "takumi" },
  haruka: { id: "user-haruka", username: "haruka" },
  haruto: { id: "user-haruto", username: "haruto" },
  haruna: { id: "user-haruna", username: "haruna" },
} as const satisfies Record<string, NkmzUser>;

export const sampleGroup: ExpenseGroup = {
  id: "group-summer-camp-2026",
  name: "Tokyo weekend",
  archivedAt: null,
  createdAt: "2026-07-01T09:00:00Z",
  updatedAt: "2026-07-03T12:00:00Z",
  participants: [
    { id: "participant-alice", userId: users.alice.id, username: users.alice.username, active: true, joinedAt: "2026-07-01T09:00:00Z" },
    { id: "participant-bob", userId: users.bob.id, username: users.bob.username, active: true, joinedAt: "2026-07-01T09:01:00Z" },
    { id: "participant-carol", userId: users.carol.id, username: users.carol.username, active: true, joinedAt: "2026-07-01T09:02:00Z" },
    { id: "participant-dave", userId: users.dave.id, username: users.dave.username, active: false, joinedAt: "2026-07-01T09:03:00Z" },
  ],
};

export const sampleExpenses: Expense[] = [
  {
    id: "expense-rail",
    description: "新幹線代",
    amount: 4_800,
    note: null,
    payers: [{ participantId: "participant-alice", amount: 4_800 }],
    shares: [
      { participantId: "participant-alice", weight: 1, allocatedAmount: 1_600 },
      { participantId: "participant-bob", weight: 1, allocatedAmount: 1_600 },
      { participantId: "participant-carol", weight: 1, allocatedAmount: 1_600 },
    ],
    createdAt: "2026-07-01T10:00:00Z",
    updatedAt: "2026-07-01T10:00:00Z",
  },
  {
    id: "expense-hotel",
    description: "宿泊費",
    amount: 9_000,
    note: "2人で立替",
    payers: [
      { participantId: "participant-bob", amount: 4_000 },
      { participantId: "participant-carol", amount: 5_000 },
    ],
    shares: [
      { participantId: "participant-alice", weight: 1, allocatedAmount: 2_770 },
      { participantId: "participant-bob", weight: 1.5, allocatedAmount: 4_154 },
      { participantId: "participant-carol", weight: 0.75, allocatedAmount: 2_076 },
    ],
    createdAt: "2026-07-02T14:00:00Z",
    updatedAt: "2026-07-02T14:00:00Z",
  },
  {
    id: "expense-snacks",
    description: "お菓子代",
    amount: 1_000,
    note: "重み0の参加者を含む",
    payers: [{ participantId: "participant-alice", amount: 1_000 }],
    shares: [
      { participantId: "participant-alice", weight: 1.25, allocatedAmount: 714 },
      { participantId: "participant-bob", weight: 0, allocatedAmount: 0 },
      { participantId: "participant-carol", weight: 0.5, allocatedAmount: 286 },
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
    { id: "participant-alice-empty", userId: users.alice.id, username: users.alice.username, active: true, joinedAt: "2026-07-04T09:00:00Z" },
  ],
};

export const emptySettlement: Settlement = {
  groupId: emptyGroup.id,
  calculatedAt: null,
  participantSummaries: [
    { participantId: "participant-alice-empty", paidAmount: 0, burdenAmount: 0, balance: 0 },
  ],
  transfers: [],
};
