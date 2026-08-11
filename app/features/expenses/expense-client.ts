import type { Expense, Id } from "@/domain/types";
import { sampleExpenses, sampleGroup } from "@/domain/test-data";
import type { ExpenseInput } from "./expense-form";

export interface ExpenseClient {
  list(groupId: Id): Promise<Expense[]>;
  create(groupId: Id, input: ExpenseInput): Promise<Expense>;
}

function cloneExpense(expense: Expense): Expense {
  return {
    ...expense,
    payers: expense.payers.map((payer) => ({ ...payer })),
    shares: expense.shares.map((share) => ({ ...share })),
  };
}

/** #28 で実 API クライアントに差し替えるまで使用する費目取得のモック。 */
export function createMockExpenseClient(
  initialExpensesByGroup: Record<Id, Expense[]> = { [sampleGroup.id]: sampleExpenses },
): ExpenseClient {
  const expensesByGroup = new Map(
    Object.entries(initialExpensesByGroup).map(([groupId, expenses]) => [
      groupId,
      expenses.map((expense) => cloneExpense(expense)),
    ]),
  );
  let nextExpenseNumber = 1;

  return {
    async list(groupId) {
      return (expensesByGroup.get(groupId) ?? []).map((expense) => cloneExpense(expense));
    },
    async create(groupId, input) {
      const now = new Date().toISOString();
      const expense: Expense = {
        id: `mock-expense-${nextExpenseNumber++}`,
        description: input.description,
        amount: input.amount,
        note: input.note,
        payers: input.payers.map((payer) => ({ ...payer })),
        shares: input.shares.map((share) => ({ ...share, allocatedAmount: 0 })),
        createdAt: now,
        updatedAt: now,
      };
      const expenses = expensesByGroup.get(groupId) ?? [];

      expenses.push(expense);
      expensesByGroup.set(groupId, expenses);

      return cloneExpense(expense);
    },
  };
}

export const expenseClient = createMockExpenseClient();
