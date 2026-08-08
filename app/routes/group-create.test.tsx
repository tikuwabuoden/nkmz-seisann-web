import { QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import { groupClient } from "@/features/groups/group-client";
import { createQueryClient } from "@/lib/query-client";
import { queryKeys } from "@/lib/query-keys";

import GroupCreate from "./group-create";

describe("精算グループ作成画面", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  function renderGroupCreate() {
    const queryClient = createQueryClient();

    return {
      queryClient,
      ...render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <GroupCreate />
          </MemoryRouter>
        </QueryClientProvider>,
      ),
    };
  }

  it("グループ名の入力欄と作成操作を表示する", () => {
    renderGroupCreate();

    expect(screen.getByRole("heading", { name: "精算グループを作成" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "グループ名" })).toBeInTheDocument();
    expect(screen.getByText("作成者は最初の参加者になります")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "作成する" })).toBeInTheDocument();
  });

  it("作成後にグループ一覧の Query を無効化する", async () => {
    const create = vi.spyOn(groupClient, "create").mockResolvedValue({
      expenseCount: 0,
      id: "mock-group-1",
      name: "夏合宿",
      participantCount: 1,
    });
    const { queryClient } = renderGroupCreate();
    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");

    fireEvent.change(screen.getByRole("textbox", { name: "グループ名" }), { target: { value: "夏合宿" } });
    fireEvent.click(screen.getByRole("button", { name: "作成する" }));

    await waitFor(() => expect(create).toHaveBeenCalledWith({ name: "夏合宿" }));
    await waitFor(() => expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: queryKeys.groups }));
  });
});
