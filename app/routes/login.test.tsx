import { QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createQueryClient } from "@/lib/query-client";

const { getCurrentUser, startDiscordLogin } = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  startDiscordLogin: vi.fn(),
}));

vi.mock("@/features/auth/auth-client", () => ({
  authClient: { getCurrentUser, startDiscordLogin },
}));

import Login from "./login";

describe("ログイン画面", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  function renderLogin() {
    const queryClient = createQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/login"]}>
          <Routes>
            <Route element={<Login />} path="/login" />
            <Route element={<p>精算グループ一覧</p>} path="/groups" />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );
  }

  it("未ログイン時にDiscordログインを開始できる", async () => {
    getCurrentUser.mockResolvedValue(null);
    renderLogin();

    fireEvent.click(await screen.findByRole("button", { name: "Discordでログイン" }));

    expect(startDiscordLogin).toHaveBeenCalledWith(`${window.location.origin}/login`);
  });

  it("ログイン済みなら精算グループ一覧へ遷移する", async () => {
    getCurrentUser.mockResolvedValue({ id: "user-1", username: "akira" });
    renderLogin();

    expect(await screen.findByText("精算グループ一覧")).toBeInTheDocument();
  });

  it("認証状態の取得に失敗した場合はエラーを表示する", async () => {
    getCurrentUser.mockRejectedValue(new Error("通信に失敗しました"));
    renderLogin();

    expect(await screen.findByRole("alert")).toHaveTextContent("認証状態の確認に失敗しました。");
  });
});
