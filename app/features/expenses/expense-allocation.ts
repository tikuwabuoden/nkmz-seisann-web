import type { Id, Participant, WeightHundredths } from "@/domain/types";

export interface ExpenseAllocationShare {
  participantId: Id;
  weight: WeightHundredths;
}

export interface ExpenseAllocationInput {
  amount: number;
  payerId: Id;
  participants: Participant[];
  shares: ExpenseAllocationShare[];
}

export interface ExpenseAllocation {
  participantId: Id;
  allocatedAmount: number;
}

/**
 * V1仕様に従って、費目総額を重み付きで参加者へ配分する。
 * 重みは小数第2位までを整数化した値で受け取り、浮動小数点数を使わない。
 */
export function calculateExpenseAllocation({ amount, payerId, participants, shares }: ExpenseAllocationInput): ExpenseAllocation[] {
  if (!Number.isSafeInteger(amount) || amount < 1) {
    throw new Error("総額は1円以上の整数で指定してください。");
  }

  const participantOrder = new Map(participants.map((participant, index) => [participant.id, index]));
  const shareIds = new Set<Id>();

  for (const share of shares) {
    if (!participantOrder.has(share.participantId)) {
      throw new Error("負担者は精算グループの参加者から指定してください。");
    }
    if (shareIds.has(share.participantId)) {
      throw new Error("同じ負担者を複数指定できません。");
    }
    if (!Number.isSafeInteger(share.weight) || share.weight < 0) {
      throw new Error("重みは0以上の小数第2位までの値で指定してください。");
    }
    shareIds.add(share.participantId);
  }

  const positiveShares = shares.filter((share) => share.weight > 0);
  const totalWeight = positiveShares.reduce((total, share) => total + share.weight, 0);

  if (positiveShares.length === 0 || !Number.isSafeInteger(totalWeight)) {
    throw new Error("重みが0より大きい負担者を1人以上指定してください。");
  }

  const amountAsBigInt = BigInt(amount);
  const totalWeightAsBigInt = BigInt(totalWeight);
  const allocations = new Map<Id, number>();
  let allocatedTotal = 0;

  for (const share of positiveShares) {
    const allocatedAmount = Number((amountAsBigInt * BigInt(share.weight)) / totalWeightAsBigInt);

    allocations.set(share.participantId, allocatedAmount);
    allocatedTotal += allocatedAmount;
  }

  const remainderRecipients = positiveShares
    .filter((share) => share.participantId !== payerId);
  const priorityRecipients = [...(remainderRecipients.length > 0 ? remainderRecipients : positiveShares)]
    .sort((left, right) => participantOrder.get(left.participantId)! - participantOrder.get(right.participantId)!);
  const remainder = amount - allocatedTotal;

  for (let index = 0; index < remainder; index += 1) {
    const recipient = priorityRecipients[index % priorityRecipients.length];

    allocations.set(recipient.participantId, allocations.get(recipient.participantId)! + 1);
  }

  return shares.map((share) => ({
    participantId: share.participantId,
    allocatedAmount: allocations.get(share.participantId) ?? 0,
  }));
}
