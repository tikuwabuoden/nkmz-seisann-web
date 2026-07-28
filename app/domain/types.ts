export type Id = string;

/** 整数の日本円金額。 */
export type Jpy = number;

/**
 * 小数第2位までを整数化した分担の重み。
 * 例: 1.25 は 125、0.50 は 50 と表す。
 */
export type WeightHundredths = number;

export type ParticipantStatus = "active" | "inactive";

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
  user: NkmzUser;
  status: ParticipantStatus;
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

export interface PaymentShare {
  participantId: Id;
  amount: Jpy;
}

export interface BurdenShare {
  participantId: Id;
  weight: WeightHundredths;
}

export interface Expense {
  id: Id;
  groupId: Id;
  description: string;
  amount: Jpy;
  memo: string | null;
  paidBy: PaymentShare[];
  burdenShares: BurdenShare[];
  createdAt: string;
  updatedAt: string;
}

export interface ParticipantSettlement {
  participantId: Id;
  paidAmount: Jpy;
  burdenAmount: Jpy;
  balance: Jpy;
}

export interface Transfer {
  fromParticipantId: Id;
  toParticipantId: Id;
  amount: Jpy;
}

export interface Settlement {
  groupId: Id;
  calculatedAt: string;
  participantSummaries: ParticipantSettlement[];
  transfers: Transfer[];
}
