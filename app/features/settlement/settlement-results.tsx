import type { Id, Settlement, Transfer } from "@/domain/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { createParticipantNameMap, findCurrentParticipant } from "./settlement-participant";

interface SettlementResultsProps {
  currentUserId: Id;
  settlement: Settlement;
}

interface PersonalTransfer {
  amount: number;
  counterpartyName: string;
  direction: "receive" | "send";
}

function formatJpy(amount: number) {
  return `¥${amount.toLocaleString("ja-JP")}`;
}

function getPersonalTransfers(transfers: Transfer[], participantId: Id, participantNames: Map<Id, string>): PersonalTransfer[] {
  return transfers.flatMap<PersonalTransfer>((transfer) => {
    if (transfer.fromParticipantId === participantId) {
      return [{ amount: transfer.amount, counterpartyName: participantNames.get(transfer.toParticipantId) ?? "不明な参加者", direction: "send" }];
    }

    if (transfer.toParticipantId === participantId) {
      return [{ amount: transfer.amount, counterpartyName: participantNames.get(transfer.fromParticipantId) ?? "不明な参加者", direction: "receive" }];
    }

    return [];
  });
}

/** BEが計算した送金案を表示する。入力中の分担額プレビューは使用しない。 */
export function SettlementResults({ currentUserId, settlement }: SettlementResultsProps) {
  const currentParticipant = findCurrentParticipant(settlement.participants, currentUserId);
  const participantNames = createParticipantNameMap(settlement.participants);
  const personalTransfers = currentParticipant
    ? getPersonalTransfers(settlement.transfers, currentParticipant.id, participantNames)
    : [];

  return (
    <div className="space-y-8 pt-4">
      <p>現在の費目・負担設定から計算しています。</p>

      <section aria-labelledby="your-settlement-heading">
        <h2 className="mb-4 text-2xl font-semibold tracking-tight" id="your-settlement-heading">
          あなたの精算
        </h2>
        {!currentParticipant || personalTransfers.length === 0 ? (
          <p>精算不要です。</p>
        ) : (
          <Table aria-label="あなたの精算">
            <TableBody>
              {personalTransfers.map((transfer, index) => (
                <TableRow key={`${transfer.direction}-${transfer.counterpartyName}-${transfer.amount}-${index}`}>
                  <TableHead scope="row">{transfer.direction === "send" ? "送る相手" : "受け取る相手"}</TableHead>
                  <TableCell>{transfer.counterpartyName}</TableCell>
                  <TableCell noWrap className="text-right tabular-nums">
                    {formatJpy(transfer.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>

      <section aria-labelledby="transfer-proposal-heading">
        <h2 className="mb-4 text-2xl font-semibold tracking-tight" id="transfer-proposal-heading">
          最終送金案
        </h2>
        {settlement.transfers.length === 0 ? (
          <p>送金案はありません。</p>
        ) : (
          <Table aria-label="最終送金案">
            <TableHeader>
              <TableRow>
                <TableHead>送る人</TableHead>
                <TableHead>受け取る人</TableHead>
                <TableHead className="text-right">金額</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {settlement.transfers.map((transfer) => (
                <TableRow key={`${transfer.fromParticipantId}-${transfer.toParticipantId}-${transfer.amount}`}>
                  <TableCell>{participantNames.get(transfer.fromParticipantId) ?? "不明な参加者"}</TableCell>
                  <TableCell>{participantNames.get(transfer.toParticipantId) ?? "不明な参加者"}</TableCell>
                  <TableCell noWrap className="text-right tabular-nums">
                    {formatJpy(transfer.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  );
}
