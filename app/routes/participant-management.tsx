import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useParams } from "react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { NkmzUser, Participant } from "@/domain/types";
import { participantClient } from "@/features/participants/participant-client";
import { queryKeys } from "@/lib/query-keys";

export function meta() {
  return [{ title: "参加者 | nkmz 精算" }];
}

interface ParticipantTableProps {
  isDeactivating: boolean;
  onDeactivate: (participantId: string) => void;
  participants: Participant[];
  title: string;
}

function ParticipantTable({ isDeactivating, onDeactivate, participants, title }: ParticipantTableProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">{title}</h2>
      {participants.length === 0 ? (
        <p className="text-sm text-muted-foreground">該当する参加者はいません。</p>
      ) : (
        <Table aria-label={title}>
          <TableHeader>
            <TableRow>
              <TableHead>ユーザー名</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {participants.map((participant) => (
              <TableRow key={participant.id}>
                <TableCell className="font-medium">{participant.username}</TableCell>
                <TableCell className="text-right">
                  <Button
                    className="h-auto px-0"
                    disabled={isDeactivating}
                    onClick={() => onDeactivate(participant.id)}
                    variant="link"
                  >
                    {isDeactivating ? "無効化中" : "無効にする"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </section>
  );
}

interface SearchResultRowProps {
  existingParticipant?: Participant;
  isAdding: boolean;
  isReactivating: boolean;
  onAdd: (userId: string) => void;
  onReactivate: (participantId: string) => void;
  user: NkmzUser;
}

function SearchResultRow({
  existingParticipant,
  isAdding,
  isReactivating,
  onAdd,
  onReactivate,
  user,
}: SearchResultRowProps) {
  if (existingParticipant?.active === false) {
    return (
      <div className="flex items-center justify-between gap-4 py-2">
        <p className="font-medium">{user.username}</p>
        <Button disabled={isReactivating} onClick={() => onReactivate(existingParticipant.id)} variant="outline">
          {isReactivating ? "再有効化中" : "再有効化"}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <p className="font-medium">{user.username}</p>
      <Button disabled={isAdding || Boolean(existingParticipant)} onClick={() => onAdd(user.id)} variant="outline">
        {existingParticipant ? "参加中" : isAdding ? "追加中" : "追加"}
      </Button>
    </div>
  );
}

export default function ParticipantManagement() {
  const { groupId = "" } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();
  const normalizedSearchQuery = searchQuery.trim();
  const participantsQuery = useQuery({
    queryKey: queryKeys.participants(groupId),
    queryFn: () => participantClient.list(groupId),
  });
  const userSearchQuery = useQuery({
    queryKey: queryKeys.userSearch(normalizedSearchQuery),
    queryFn: () => participantClient.searchUsers(normalizedSearchQuery),
    enabled: normalizedSearchQuery.length > 0,
  });
  const addParticipant = useMutation({
    mutationFn: (userId: string) => participantClient.add(groupId, userId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.participants(groupId) });
    },
  });
  const participantActivityMutation = useMutation({
    mutationFn: ({ active, participantId }: { active: boolean; participantId: string }) =>
      active
        ? participantClient.activate(groupId, participantId)
        : participantClient.deactivate(groupId, participantId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.participants(groupId) });
    },
  });
  const participants = participantsQuery.data ?? [];
  const activeParticipants = participants.filter((participant) => participant.active);
  const participantsByUserId = new Map(participants.map((participant) => [participant.userId, participant]));

  return (
    <main className="space-y-8 p-4">
      <h1 className="text-3xl font-semibold tracking-tight">参加者</h1>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">参加者を検索</h2>
        <Input
          aria-label="nkmzユーザー名で検索"
          className="h-12"
          maxLength={32}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="nkmzユーザー名で検索"
          value={searchQuery}
        />
        {normalizedSearchQuery ? (
          <div className="pt-1">
            {userSearchQuery.isPending ? <p role="status">ユーザーを検索しています。</p> : null}
            {userSearchQuery.isError ? <p role="alert">ユーザーの検索に失敗しました。</p> : null}
            {!userSearchQuery.isPending && !userSearchQuery.isError && userSearchQuery.data?.length === 0 ? (
              <p className="text-sm text-muted-foreground">該当するユーザーはいません。</p>
            ) : null}
            {userSearchQuery.data?.map((user) => (
              <SearchResultRow
                existingParticipant={participantsByUserId.get(user.id)}
                isAdding={addParticipant.isPending}
                isReactivating={participantActivityMutation.isPending}
                key={user.id}
                onAdd={(userId) => addParticipant.mutate(userId)}
                onReactivate={(participantId) => participantActivityMutation.mutate({ active: true, participantId })}
                user={user}
              />
            ))}
            {addParticipant.isError ? <p role="alert">参加者の追加に失敗しました。</p> : null}
            {participantActivityMutation.isError ? <p role="alert">参加状態の変更に失敗しました。</p> : null}
          </div>
        ) : null}
      </section>

      {participantsQuery.isPending ? <p role="status">参加者を読み込んでいます。</p> : null}
      {participantsQuery.isError ? <p role="alert">参加者の取得に失敗しました。</p> : null}
      {!participantsQuery.isPending && !participantsQuery.isError ? (
        <>
          <ParticipantTable
            isDeactivating={participantActivityMutation.isPending}
            onDeactivate={(participantId) => participantActivityMutation.mutate({ active: false, participantId })}
            participants={activeParticipants}
            title="参加中の参加者"
          />
        </>
      ) : null}
    </main>
  );
}
