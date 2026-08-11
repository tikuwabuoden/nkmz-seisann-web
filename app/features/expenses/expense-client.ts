import type { Expense, Id } from "@/domain/types";
import { sampleExpenses, sampleGroup } from "@/domain/test-data";

export interface ExpenseClient {
  list(groupId: Id): Promise<Expense[]>;
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

  return {
    async list(groupId) {
      return (expensesByGroup.get(groupId) ?? []).map((expense) => cloneExpense(expense));
    },
  };
}

export const expenseClient = createMockExpenseClient();
