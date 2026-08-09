import type { Expense, Id } from "@/domain/types";
import { sampleExpenses } from "@/domain/test-data";

export interface ExpenseClient {
  list(groupId: Id): Promise<Expense[]>;
}

function cloneExpense(expense: Expense): Expense {
  return {
    ...expense,
    burdenShares: expense.burdenShares.map((share) => ({ ...share })),
    paidBy: expense.paidBy.map((share) => ({ ...share })),
  };
}

/** #28 で実 API クライアントに差し替えるまで使用する費目取得のモック。 */
export function createMockExpenseClient(initialExpenses: Expense[] = sampleExpenses): ExpenseClient {
  const expenses = initialExpenses.map((expense) => cloneExpense(expense));

  return {
    async list(groupId) {
      return expenses.filter((expense) => expense.groupId === groupId).map((expense) => cloneExpense(expense));
    },
  };
}

export const expenseClient = createMockExpenseClient();
