import type { Expense, Id } from "@/domain/types";
import { sampleExpenses, sampleGroup } from "@/domain/test-data";
import type { ExpenseInput } from "./expense-form";

export interface ExpenseClient {
  list(groupId: Id): Promise<Expense[]>;
  get(groupId: Id, expenseId: Id): Promise<Expense | null>;
  create(groupId: Id, input: ExpenseInput): Promise<Expense>;
  update(groupId: Id, expenseId: Id, input: ExpenseInput): Promise<Expense>;
  delete(groupId: Id, expenseId: Id): Promise<void>;
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
    async get(groupId, expenseId) {
      const expense = (expensesByGroup.get(groupId) ?? []).find((item) => item.id === expenseId);

      return expense ? cloneExpense(expense) : null;
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
    async update(groupId, expenseId, input) {
      const expenses = expensesByGroup.get(groupId) ?? [];
      const index = expenses.findIndex((expense) => expense.id === expenseId);

      if (index === -1) {
        throw new Error("費目が見つかりません。");
      }

      const existingExpense = expenses[index];
      const updatedExpense: Expense = {
        ...existingExpense,
        description: input.description,
        amount: input.amount,
        note: input.note,
        payers: input.payers.map((payer) => ({ ...payer })),
        shares: input.shares.map((share) => ({ ...share, allocatedAmount: 0 })),
        updatedAt: new Date().toISOString(),
      };

      expenses[index] = updatedExpense;

      return cloneExpense(updatedExpense);
    },
    async delete(groupId, expenseId) {
      const expenses = expensesByGroup.get(groupId) ?? [];
      const index = expenses.findIndex((expense) => expense.id === expenseId);

      if (index === -1) {
        throw new Error("費目が見つかりません。");
      }

      expenses.splice(index, 1);
    },
  };
}

export const expenseClient = createMockExpenseClient();
