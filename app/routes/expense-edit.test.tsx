import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import { sampleExpenses, sampleGroup } from "@/domain/test-data";
import type { Expense } from "@/domain/types";
import { expenseClient } from "@/features/expenses/expense-client";
import { participantClient } from "@/features/participants/participant-client";

import ExpenseEdit from "./expense-edit";

function renderExpenseEdit() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const router = createMemoryRouter(
    [
      { element: <ExpenseEdit />, path: "/groups/:groupId/expenses/:expenseId/edit" },
      { element: <p>支払い一覧</p>, path: "/groups/:groupId" },
    ],
    { initialEntries: [`/groups/${sampleGroup.id}/expenses/${sampleExpenses[0].id}/edit`] },
  );

  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

describe("費目編集画面", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("既存の費目を表示し、変更を保存できる", async () => {
    vi.spyOn(participantClient, "list").mockResolvedValue(sampleGroup.participants);
    vi.spyOn(expenseClient, "get").mockResolvedValue(sampleExpenses[0]);
    const update = vi.spyOn(expenseClient, "update").mockReturnValue(new Promise<Expense>(() => {}));

    renderExpenseEdit();

    const description = await screen.findByLabelText("内容");
    fireEvent.change(description, { target: { value: "更新後の費目" } });
    fireEvent.click(screen.getByRole("button", { name: "保存する" }));

    await waitFor(() => {
      expect(update).toHaveBeenCalledWith(
        sampleGroup.id,
        sampleExpenses[0].id,
        expect.objectContaining({ description: "更新後の費目" }),
      );
    });
  });

  it("削除確認後に費目を削除できる", async () => {
    vi.spyOn(participantClient, "list").mockResolvedValue(sampleGroup.participants);
    vi.spyOn(expenseClient, "get").mockResolvedValue(sampleExpenses[0]);
    const deleteExpense = vi.spyOn(expenseClient, "delete").mockReturnValue(new Promise<void>(() => {}));

    renderExpenseEdit();

    await screen.findByLabelText("内容");
    fireEvent.click(screen.getByRole("button", { name: /^削除$/ }));
    expect(screen.getByRole("heading", { name: "費目を削除しますか？" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "削除する" }));

    await waitFor(() => {
      expect(deleteExpense).toHaveBeenCalledWith(sampleGroup.id, sampleExpenses[0].id);
    });
  });
});
