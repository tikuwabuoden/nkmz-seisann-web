import { sampleGroup, users } from "@/domain/test-data";
import type { Id, NkmzUser, Participant, ParticipantStatus } from "@/domain/types";

export interface ParticipantClient {
  list(groupId: Id): Promise<Participant[]>;
  searchUsers(query: string): Promise<NkmzUser[]>;
  add(groupId: Id, userId: Id): Promise<Participant>;
  updateStatus(groupId: Id, participantId: Id, status: ParticipantStatus): Promise<Participant>;
}

function cloneParticipant(participant: Participant): Participant {
  return {
    ...participant,
    user: { ...participant.user },
  };
}

/** #28 で実 API クライアントに差し替えるまで使用する参加者のモッククライアント。 */
export function createMockParticipantClient(
  initialParticipants: Record<Id, Participant[]> = { [sampleGroup.id]: sampleGroup.participants },
  initialUsers: NkmzUser[] = Object.values(users),
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

      return availableUsers
        .filter((user) => user.username.toLocaleLowerCase().includes(normalizedQuery))
        .slice(0, 10)
        .map((user) => ({ ...user }));
    },
    async add(groupId, userId) {
      const user = availableUsers.find((candidate) => candidate.id === userId);
      if (!user) {
        throw new Error("追加するユーザーが見つかりません。");
      }

      const participant: Participant = {
        id: `mock-participant-${nextParticipantNumber++}`,
        user: { ...user },
        status: "active",
        joinedAt: new Date().toISOString(),
      };
      const participants = participantsByGroup.get(groupId) ?? [];
      participants.push(participant);
      participantsByGroup.set(groupId, participants);

      return cloneParticipant(participant);
    },
    async updateStatus(groupId, participantId, status) {
      const participant = (participantsByGroup.get(groupId) ?? []).find(
        (candidate) => candidate.id === participantId,
      );
      if (!participant) {
        throw new Error("参加者が見つかりません。");
      }

      participant.status = status;
      return cloneParticipant(participant);
    },
  };
}

export const participantClient = createMockParticipantClient();
