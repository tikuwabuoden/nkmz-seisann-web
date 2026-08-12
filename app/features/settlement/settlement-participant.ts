import type { Id, Participant } from "@/domain/types";

/** ログイン中のnkmzユーザーに対応する精算グループ参加者を返す。 */
export function findCurrentParticipant(participants: Participant[], currentUserId: Id): Participant | null {
  return participants.find((participant) => participant.userId === currentUserId) ?? null;
}

/** 送金案のparticipantIdを画面表示用の参加者名へ変換する。 */
export function createParticipantNameMap(participants: Participant[]): Map<Id, string> {
  return new Map(participants.map((participant) => [participant.id, participant.username]));
}
