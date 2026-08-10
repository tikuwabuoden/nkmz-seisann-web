import { describe, expect, it } from "vitest";

import type { NkmzUser, Participant } from "@/domain/types";
import { createMockParticipantClient } from "@/features/participants/participant-client";

const groupId = "group-test";
const alice: NkmzUser = { id: "user-alice", username: "alice" };
const haruka: NkmzUser = { id: "user-haruka", username: "haruka" };
const participants: Participant[] = [
  {
    id: "participant-alice",
    userId: alice.id,
    username: alice.username,
    active: true,
    joinedAt: "2026-08-01T00:00:00Z",
  },
];

describe("参加者のモッククライアント", () => {
  it("検索したユーザーを追加し、無効化と再有効化ができる", async () => {
    const client = createMockParticipantClient({ [groupId]: participants }, [alice, haruka], alice.id);

    const addedParticipant = await client.add(groupId, haruka.id);
    await expect(client.deactivate(groupId, addedParticipant.id)).resolves.toMatchObject({ active: false });
    await expect(client.activate(groupId, addedParticipant.id)).resolves.toMatchObject({ active: true });
  });

  it("空の検索、重複追加、20人超過を受け付けない", async () => {
    const twentyParticipants = Array.from({ length: 20 }, (_, index) => ({
      id: `participant-${index}`,
      userId: `user-${index}`,
      username: `user${index}`,
      active: true,
      joinedAt: "2026-08-01T00:00:00Z",
    }));
    const limitClient = createMockParticipantClient(
      { [groupId]: twentyParticipants },
      [...twentyParticipants.map(({ userId, username }) => ({ id: userId, username })), haruka],
      "user-0",
    );
    const duplicateClient = createMockParticipantClient({ [groupId]: participants }, [alice, haruka], alice.id);

    await expect(duplicateClient.searchUsers("")).rejects.toThrow("検索文字列は1文字以上32文字以内で入力してください。");
    await expect(duplicateClient.add(groupId, alice.id)).rejects.toThrow("このユーザーはすでに参加しています。");
    await expect(limitClient.add(groupId, haruka.id)).rejects.toThrow("参加者は20人までです。");
  });

  it("自分自身を無効化できない", async () => {
    const client = createMockParticipantClient({ [groupId]: participants }, [alice], alice.id);

    await expect(client.deactivate(groupId, "participant-alice")).rejects.toThrow(
      "自分自身を無効化することはできません。",
    );
  });
});
