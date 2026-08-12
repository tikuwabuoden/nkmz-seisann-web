import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, vi } from "vitest";

import { groupClient } from "@/features/groups/group-client";
import { groupListItems } from "@/features/groups/group-list-data";
import { createQueryClient } from "@/lib/query-client";

import GroupList from "./group-list";

function renderGroupList() {
  vi.spyOn(groupClient, "list").mockResolvedValue(groupListItems);
  const queryClient = createQueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <GroupList />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("精算グループ一覧画面", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("グループ名、参加者数、費目数を表示する", async () => {
    renderGroupList();

    expect(screen.getByRole("heading", { name: "精算グループ" })).toBeInTheDocument();
    expect(await screen.findByRole("cell", { name: "夏合宿 2026" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "4人" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "3件" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "春の飲み会" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "6人" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "5件" })).toBeInTheDocument();
  });

  it("各グループの詳細画面へ遷移するリンクを表示する", async () => {
    renderGroupList();

    expect(await screen.findByRole("link", { name: "夏合宿 2026の詳細を開く" })).toHaveAttribute(
      "href",
      "/groups/group-summer-camp-2026",
    );
    expect(screen.getByRole("link", { name: "春の飲み会の詳細を開く" })).toHaveAttribute(
      "href",
      "/groups/group-spring-drinking-party",
    );
  });

  it("グループ作成画面へ遷移するリンクを表示する", () => {
    renderGroupList();

    expect(screen.getByRole("link", { name: "精算グループを作成" })).toHaveAttribute(
      "href",
      "/groups/new",
    );
  });
});
