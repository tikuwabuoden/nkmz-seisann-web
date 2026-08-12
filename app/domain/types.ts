export type Id = string;

/** 整数の日本円金額。 */
export type Jpy = number;

/**
 * 小数第2位までを整数化した分担の重み。
 * 例: 1.25 は 125、0.50 は 50 と表す。
 */
export type WeightHundredths = number;

/**
 * nkmz に登録されたユーザー。
 * Discord ID は認証基盤の内部情報であり、精算 Web の V1 API では扱わない。
 */
export interface NkmzUser {
  id: Id;
  username: string;
}

export interface Participant {
  id: Id;
  userId: Id;
  username: string;
  active: boolean;
  joinedAt: string;
}

export interface ExpenseGroup {
  id: Id;
  name: string;
  /** 未アーカイブのグループは null、アーカイブ済みなら日時。 */
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  participants: Participant[];
}

export interface ExpensePayer {
  participantId: Id;
  amount: Jpy;
}

export interface ExpenseShare {
  participantId: Id;
  weight: number;
  allocatedAmount: Jpy;
}

export interface Expense {
  id: Id;
  description: string;
  amount: Jpy;
  note: string | null;
  payers: ExpensePayer[];
  shares: ExpenseShare[];
  createdAt: string;
  updatedAt: string;
}

/** BEのExpenseGroupSettlement.participantsに対応する参加者別集計。 */
export interface SettlementParticipant extends Participant {
  paidAmount: Jpy;
  owedAmount: Jpy;
  balance: Jpy;
}

export interface Transfer {
  fromParticipantId: Id;
  toParticipantId: Id;
  amount: Jpy;
}

export interface Settlement {
  participants: SettlementParticipant[];
  transfers: Transfer[];
}
