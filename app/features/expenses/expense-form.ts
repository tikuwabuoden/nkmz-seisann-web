import type { Id, Participant } from "@/domain/types";

export interface ExpenseFormPayer {
  participantId: Id;
  amount: string;
}

export interface ExpenseFormShare {
  participantId: Id;
  weight: string;
}

export interface ExpenseFormValues {
  description: string;
  amount: string;
  note: string;
  payers: ExpenseFormPayer[];
  shares: ExpenseFormShare[];
}

export interface ExpenseInput {
  description: string;
  amount: number;
  note: string | null;
  payers: Array<{ participantId: Id; amount: number }>;
  shares: Array<{ participantId: Id; weight: number }>;
}

export interface ExpenseFormValidationResult {
  input: ExpenseInput | null;
  errors: string[];
}

export function createInitialExpenseForm(participants: Participant[]): ExpenseFormValues {
  const activeParticipants = participants.filter((participant) => participant.active);

  return {
    description: "",
    amount: "",
    note: "",
    payers: activeParticipants[0] ? [{ participantId: activeParticipants[0].id, amount: "" }] : [],
    shares: activeParticipants.map((participant) => ({ participantId: participant.id, weight: "1" })),
  };
}

export function validateExpenseForm(values: ExpenseFormValues): ExpenseFormValidationResult {
  const errors: string[] = [];
  const description = values.description.trim();
  const note = values.note.trim();
  const amount = parseAmount(values.amount);
  const payers = values.payers.map((payer) => ({
    participantId: payer.participantId,
    amount: parseAmount(payer.amount),
  }));
  const shares = values.shares.map((share) => ({
    participantId: share.participantId,
    weight: parseWeight(share.weight),
  }));

  if (!description) {
    errors.push("内容を入力してください。");
  } else if (description.length > 200) {
    errors.push("内容は200文字以内で入力してください。");
  }
  if (amount === null) {
    errors.push("総額は1円以上の整数で入力してください。");
  }
  if (note.length > 1_000) {
    errors.push("メモは1000文字以内で入力してください。");
  }

  if (payers.length === 0) {
    errors.push("立替者を1人以上指定してください。");
  } else if (hasDuplicateParticipant(payers)) {
    errors.push("同じ立替者を複数指定できません。");
  } else if (payers.some((payer) => payer.amount === null)) {
    errors.push("立替額は1円以上の整数で入力してください。");
  } else if (amount !== null && payers.reduce((total, payer) => total + payer.amount!, 0) !== amount) {
    errors.push("立替額の合計を総額と一致させてください。");
  }

  if (shares.length === 0) {
    errors.push("負担者を1人以上指定してください。");
  } else if (hasDuplicateParticipant(shares)) {
    errors.push("同じ負担者を複数指定できません。");
  } else if (shares.some((share) => share.weight === null)) {
    errors.push("重みは0以上、小数第2位までで入力してください。");
  } else if (shares.every((share) => share.weight === 0)) {
    errors.push("重みが正の参加者を1人以上指定してください。");
  }

  if (errors.length > 0 || amount === null || payers.some((payer) => payer.amount === null) || shares.some((share) => share.weight === null)) {
    return { input: null, errors };
  }

  return {
    input: {
      description,
      amount,
      note: note || null,
      payers: payers.map((payer) => ({ participantId: payer.participantId, amount: payer.amount! })),
      shares: shares.map((share) => ({ participantId: share.participantId, weight: share.weight! })),
    },
    errors: [],
  };
}

function parseAmount(value: string): number | null {
  const normalized = value.trim();

  if (!/^\d+$/.test(normalized)) {
    return null;
  }

  const amount = Number(normalized);

  return Number.isSafeInteger(amount) && amount >= 1 ? amount : null;
}

function parseWeight(value: string): number | null {
  const normalized = value.trim();

  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) {
    return null;
  }

  const [integer, decimal = ""] = normalized.split(".");
  const units = Number(`${integer}${decimal.padEnd(2, "0")}`);

  return Number.isSafeInteger(units) ? units / 100 : null;
}

function hasDuplicateParticipant(items: Array<{ participantId: Id }>): boolean {
  return new Set(items.map((item) => item.participantId)).size !== items.length;
}
