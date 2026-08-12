import type { Expense, Id } from "@/domain/types";
import { sampleExpenses, sampleGroup } from "@/domain/test-data";
import { apiUrl, createApiClient, type ApiClient } from "@/lib/api-client";
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

interface ExpenseListResponse {
  items: Expense[];
  nextCursor: string | null;
}

function expenseListUrl(groupId: Id, cursor?: string): string {
  const parameters = new URLSearchParams({ limit: "100" });
  if (cursor) parameters.set("cursor", cursor);

  return apiUrl(`/expense-groups/${groupId}/expenses?${parameters.toString()}`);
}

/** nkmz API を使う費目クライアントを作成する。 */
export function createNkmzExpenseClient(client: ApiClient = createApiClient()): ExpenseClient {
  return {
    async list(groupId) {
      const expenses: Expense[] = [];
      let cursor: string | null = null;

      do {
        const response: ExpenseListResponse | undefined = await client.request<ExpenseListResponse>(expenseListUrl(groupId, cursor ?? undefined));
        if (!response) throw new Error("費目一覧の応答が空です。");
        expenses.push(...response.items);
        cursor = response.nextCursor;
      } while (cursor);

      return expenses;
    },
    async get(groupId, expenseId) {
      const expense = await client.request<Expense>(apiUrl(`/expense-groups/${groupId}/expenses/${expenseId}`));
      if (!expense) throw new Error("費目取得の応答が空です。");
      return expense;
    },
    async create(groupId, input) {
      const expense = await client.request<Expense>(apiUrl(`/expense-groups/${groupId}/expenses`), { body: input, method: "POST" });
      if (!expense) throw new Error("費目作成の応答が空です。");
      return expense;
    },
    async update(groupId, expenseId, input) {
      const expense = await client.request<Expense>(apiUrl(`/expense-groups/${groupId}/expenses/${expenseId}`), { body: input, method: "PUT" });
      if (!expense) throw new Error("費目更新の応答が空です。");
      return expense;
    },
    async delete(groupId, expenseId) {
      await client.request(apiUrl(`/expense-groups/${groupId}/expenses/${expenseId}`), { method: "DELETE" });
    },
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

export const expenseClient = createNkmzExpenseClient();
