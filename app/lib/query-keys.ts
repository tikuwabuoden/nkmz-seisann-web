import type { Id } from "@/domain/types";

/** TanStack Query で使用するキャッシュキー。 */
export const queryKeys = {
  auth: ["auth"] as const,
  groups: ["groups"] as const,
  group: (groupId: Id) => ["groups", groupId] as const,
  participants: (groupId: Id) => ["groups", groupId, "participants"] as const,
  expenses: (groupId: Id) => ["groups", groupId, "expenses"] as const,
  expense: (groupId: Id, expenseId: Id) => ["groups", groupId, "expenses", expenseId] as const,
  settlement: (groupId: Id) => ["groups", groupId, "settlement"] as const,
};
