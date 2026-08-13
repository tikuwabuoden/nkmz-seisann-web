import { sampleGroup, users } from "@/domain/test-data";
import type { Id, NkmzUser, Participant } from "@/domain/types";
import { apiUrl, createApiClient, type ApiClient } from "@/lib/api-client";

export interface ParticipantClient {
  list(groupId: Id): Promise<Participant[]>;
  searchUsers(query: string): Promise<NkmzUser[]>;
  add(groupId: Id, userId: Id): Promise<Participant>;
  activate(groupId: Id, participantId: Id): Promise<Participant>;
  deactivate(groupId: Id, participantId: Id): Promise<Participant>;
}

interface UserSearchResponse {
  items: NkmzUser[];
}

function cloneParticipant(participant: Participant): Participant {
  return { ...participant };
}

export function createNkmzParticipantClient(client: ApiClient = createApiClient()): ParticipantClient {
  return {
    async list(groupId) {
      const participants = await client.request<Participant[]>(apiUrl(`/expense-groups/${groupId}/participants`));
      if (!participants) throw new Error("参加者一覧の応答が空です。");
      return participants;
    },
    async searchUsers(query) {
      const users = await client.request<UserSearchResponse>(apiUrl(`/users/search?query=${encodeURIComponent(query.trim())}`));
      if (!users) throw new Error("ユーザー検索の応答が空です。");
      return users.items;
    },
    async add(groupId, userId) {
      const participant = await client.request<Participant>(apiUrl(`/expense-groups/${groupId}/participants`), { body: { userId }, method: "POST" });
      if (!participant) throw new Error("参加者追加の応答が空です。");
      return participant;
    },
    async activate(groupId, participantId) {
      const participant = await client.request<Participant>(apiUrl(`/expense-groups/${groupId}/participants/${participantId}/activate`), { method: "POST" });
      if (!participant) throw new Error("参加者有効化の応答が空です。");
      return participant;
    },
    async deactivate(groupId, participantId) {
      const participant = await client.request<Participant>(apiUrl(`/expense-groups/${groupId}/participants/${participantId}/deactivate`), { method: "POST" });
      if (!participant) throw new Error("参加者無効化の応答が空です。");
      return participant;
    },
  };
}

/** 画面テスト用の参加者クライアントを作成する。 */
export function createMockParticipantClient(
  initialParticipants: Record<Id, Participant[]> = { [sampleGroup.id]: sampleGroup.participants },
  initialUsers: NkmzUser[] = Object.values(users),
  currentUserId: Id = users.alice.id,
): ParticipantClient {
  const participantsByGroup = new Map(
    Object.entries(initialParticipants).map(([groupId, participants]) => [
      groupId,
      participants.map((participant) => cloneParticipant(participant)),
    ]),
  );
  const availableUsers = initialUsers.map((user) => ({ ...user }));
  let nextParticipantNumber = 1;

  return {
    async list(groupId) {
      return (participantsByGroup.get(groupId) ?? []).map((participant) => cloneParticipant(participant));
    },
    async searchUsers(query) {
      const normalizedQuery = query.trim().toLocaleLowerCase();
      if (!normalizedQuery || normalizedQuery.length > 32) {
        throw new Error("検索文字列は1文字以上32文字以内で入力してください。");
      }
      return availableUsers
        .filter((user) => user.username.toLocaleLowerCase().includes(normalizedQuery))
        .slice(0, 10)
        .map((user) => ({ ...user }));
    },
    async add(groupId, userId) {
      const user = availableUsers.find((candidate) => candidate.id === userId);
      if (!user) throw new Error("追加するユーザーが見つかりません。");

      const participants = participantsByGroup.get(groupId) ?? [];
      if (participants.length >= 20) throw new Error("参加者は20人までです。");
      if (participants.some((participant) => participant.userId === userId)) {
        throw new Error("このユーザーはすでに参加しています。");
      }

      const participant: Participant = {
        id: `mock-participant-${nextParticipantNumber++}`,
        userId: user.id,
        username: user.username,
        active: true,
        joinedAt: new Date().toISOString(),
      };
      participants.push(participant);
      participantsByGroup.set(groupId, participants);
      return cloneParticipant(participant);
    },
    async activate(groupId, participantId) {
      return setActive(groupId, participantId, true);
    },
    async deactivate(groupId, participantId) {
      return setActive(groupId, participantId, false);
    },
  };

  function setActive(groupId: Id, participantId: Id, active: boolean): Participant {
    const participant = (participantsByGroup.get(groupId) ?? []).find((candidate) => candidate.id === participantId);
    if (!participant) throw new Error("参加者が見つかりません。");
    if (!active && participant.userId === currentUserId) {
      throw new Error("自分自身を無効化することはできません。");
    }
    if (participant.active === active) {
      throw new Error(active ? "参加者はすでに有効です。" : "参加者はすでに無効です。");
    }
    participant.active = active;
    return cloneParticipant(participant);
  }
}

export const participantClient = createNkmzParticipantClient();
