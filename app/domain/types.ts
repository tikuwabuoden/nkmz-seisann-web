export type Id = string;

/** An integer amount in Japanese yen. */
export type Jpy = number;

/**
 * A share weight expressed in hundredths.
 * For example, 1.25 is represented as 125 and 0.50 as 50.
 */
export type WeightHundredths = number;

export type ParticipantStatus = "active" | "inactive";

export interface User {
  id: Id;
  username: string;
}

export interface Participant {
  id: Id;
  user: User;
  status: ParticipantStatus;
  joinedAt: string;
}

export interface ExpenseGroup {
  id: Id;
  name: string;
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
