import { QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import { sampleExpenses, sampleGroup } from "@/domain/test-data";
import { expenseClient } from "@/features/expenses/expense-client";
import { participantClient } from "@/features/participants/participant-client";
import { createQueryClient } from "@/lib/query-client";

import ExpenseCreate from "./expense-create";

const { navigate } = vi.hoisted(() => ({ navigate: vi.fn() }));

vi.mock("react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router")>()),
  useBeforeUnload: vi.fn(),
  useBlocker: () => ({ proceed: vi.fn(), reset: vi.fn(), state: "unblocked" }),
  useNavigate: () => navigate,
}));

function renderExpenseCreate() {
  const queryClient = createQueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/groups/${sampleGroup.id}/expenses/new`]}>
        <Routes>
          <Route element={<ExpenseCreate />} path="/groups/:groupId/expenses/new" />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("新規支払い画面", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    navigate.mockClear();
  });

  it("変更済みのフォームを保存すると支払い一覧へ遷移できる", async () => {
    vi.spyOn(participantClient, "list").mockResolvedValue(sampleGroup.participants);
    vi.spyOn(expenseClient, "create").mockResolvedValue(sampleExpenses[0]);

    renderExpenseCreate();

    fireEvent.change(await screen.findByLabelText("内容"), { target: { value: "昼食代" } });
    fireEvent.change(screen.getByLabelText("総額"), { target: { value: "1200" } });
    fireEvent.click(screen.getByRole("button", { name: "保存する" }));

    await waitFor(() => expect(navigate).toHaveBeenCalledWith(`/groups/${sampleGroup.id}`, { replace: true }));
  });
});
