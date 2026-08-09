import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Expense } from "@/domain/types";
import { expenseClient } from "@/features/expenses/expense-client";

import GroupDetail from "./group-detail";

function renderGroupDetail() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/groups/group-tokyo-2026"]}>
        <Routes>
          <Route element={<GroupDetail />} path="/groups/:groupId" />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("支払い一覧画面", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("モックデータから支払い一覧と合計を表示する", async () => {
    renderGroupDetail();

    expect(await screen.findByRole("cell", { name: "Rail tickets" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "¥14,800" })).toBeInTheDocument();
  });

  it("読み込み中を表示する", async () => {
    let resolveList: (expenses: Expense[]) => void;
    const pendingExpenses = new Promise<Expense[]>((resolve) => {
      resolveList = resolve;
    });
    vi.spyOn(expenseClient, "list").mockReturnValue(pendingExpenses);

    renderGroupDetail();

    expect(await screen.findByRole("status")).toHaveTextContent("支払いを読み込んでいます。");
    resolveList!([]);
  });

  it("支払いが0件の場合を表示する", async () => {
    vi.spyOn(expenseClient, "list").mockResolvedValue([]);

    renderGroupDetail();

    expect(await screen.findByText("支払いはありません。")).toBeInTheDocument();
  });

  it("取得に失敗した場合を表示する", async () => {
    vi.spyOn(expenseClient, "list").mockRejectedValue(new Error("通信に失敗しました"));

    renderGroupDetail();

    expect(await screen.findByRole("alert")).toHaveTextContent("支払いの取得に失敗しました。");
  });
});
