import { describe, expect, it } from "vitest";

import { createMockParticipantClient } from "@/features/participants/participant-client";
import type { NkmzUser, Participant } from "@/domain/types";

const groupId = "group-test";
const participants: Participant[] = [
  {
    id: "participant-alice",
    user: { id: "user-alice", username: "あきら" },
    status: "active",
    joinedAt: "2026-08-01T00:00:00Z",
  },
];
const users: NkmzUser[] = [
  participants[0].user,
  { id: "user-haruka", username: "はるか" },
];

describe("参加者のモッククライアント", () => {
  it("グループに紐づく参加者だけを返す", async () => {
    const client = createMockParticipantClient({ [groupId]: participants });

    await expect(client.list(groupId)).resolves.toEqual(participants);
    await expect(client.list("group-another")).resolves.toEqual([]);
  });

  it("ユーザー名の部分一致で最大10件を検索する", async () => {
    const searchUsers = Array.from({ length: 11 }, (_, index) => ({
      id: `user-${index}`,
      username: `参加者${index}`,
    }));
    const client = createMockParticipantClient({}, searchUsers);

    await expect(client.searchUsers("加者")).resolves.toHaveLength(10);
  });

  it("検索したユーザーを参加者として追加し、状態を変更できる", async () => {
    const client = createMockParticipantClient({ [groupId]: participants }, users);

    const addedParticipant = await client.add(groupId, "user-haruka");
    await expect(client.updateStatus(groupId, addedParticipant.id, "inactive")).resolves.toMatchObject({
      id: addedParticipant.id,
      status: "inactive",
    });
  });
});
