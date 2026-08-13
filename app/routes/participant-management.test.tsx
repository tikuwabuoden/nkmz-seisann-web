import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { NkmzUser, Participant } from "@/domain/types";
import { participantClient } from "@/features/participants/participant-client";

import ParticipantManagement from "./participant-management";

const groupId = "group-summer-camp-2026";
const activeParticipant: Participant = {
  id: "participant-akira",
  userId: "user-akira",
  username: "akira",
  active: true,
  joinedAt: "2026-08-01T00:00:00Z",
};
const inactiveParticipant: Participant = {
  id: "participant-haruka",
  userId: "user-haruka",
  username: "haruka",
  active: false,
  joinedAt: "2026-08-01T00:00:00Z",
};
const haruka: NkmzUser = { id: "user-haruka", username: "haruka" };
const haruto: NkmzUser = { id: "user-haruto", username: "haruto" };

function renderParticipantManagement() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/groups/${groupId}/participants`]}>
        <Routes>
          <Route element={<ParticipantManagement />} path="/groups/:groupId/participants" />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("参加者管理画面", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("複数の検索結果から追加または再有効化できる", async () => {
    const add = vi.spyOn(participantClient, "add").mockResolvedValue(activeParticipant);
    const activate = vi.spyOn(participantClient, "activate").mockResolvedValue({ ...inactiveParticipant, active: true });
    vi.spyOn(participantClient, "list").mockResolvedValue([activeParticipant, inactiveParticipant]);
    vi.spyOn(participantClient, "searchUsers").mockResolvedValue([haruka, haruto]);

    renderParticipantManagement();

    expect(await screen.findByText("akira")).toBeInTheDocument();

    fireEvent.change(screen.getByRole("textbox", { name: "nkmzユーザー名で検索" }), {
      target: { value: "har" },
    });

    expect(await screen.findByText("haruka")).toBeInTheDocument();
    expect(screen.getByText("haruto")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "再有効化" }));
    fireEvent.click(screen.getByRole("button", { name: "追加" }));

    await waitFor(() => expect(activate).toHaveBeenCalledWith(groupId, inactiveParticipant.id));
    await waitFor(() => expect(add).toHaveBeenCalledWith(groupId, haruto.id));
  });

  it("検索と参加者一覧の失敗を表示する", async () => {
    vi.spyOn(participantClient, "list").mockRejectedValue(new Error("通信に失敗しました"));
    vi.spyOn(participantClient, "searchUsers").mockRejectedValue(new Error("通信に失敗しました"));

    renderParticipantManagement();

    fireEvent.change(screen.getByRole("textbox", { name: "nkmzユーザー名で検索" }), {
      target: { value: "har" },
    });

    expect(
      await screen.findAllByText("予期しないエラーが発生しました。再試行してください。"),
    ).toHaveLength(2);
  });

  it("追加と無効化の失敗を表示する", async () => {
    vi.spyOn(participantClient, "add").mockRejectedValue(new Error("通信に失敗しました"));
    vi.spyOn(participantClient, "deactivate").mockRejectedValue(new Error("通信に失敗しました"));
    vi.spyOn(participantClient, "list").mockResolvedValue([activeParticipant]);
    vi.spyOn(participantClient, "searchUsers").mockResolvedValue([haruto]);

    renderParticipantManagement();

    expect(await screen.findByText("akira")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "無効にする" }));
    expect(
      await screen.findByText("予期しないエラーが発生しました。再試行してください。"),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByRole("textbox", { name: "nkmzユーザー名で検索" }), {
      target: { value: "har" },
    });
    fireEvent.click(await screen.findByRole("button", { name: "追加" }));

    expect(
      await screen.findByText("予期しないエラーが発生しました。再試行してください。"),
    ).toBeInTheDocument();
  });
});
