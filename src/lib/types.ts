export type Client = {
  _id?: string;
  email: string;
  phone: string;
  wallet: string;
  createdAt?: string;
  updatedAt?: string;
};

// Tipos compartidos para grupos y votos

export type Member = { name: string; initials: string; contribution: number };

export type TransactionType = "contribution" | "withdrawal" | "dividend" | "fee";
export type Transaction = {
  id: number;
  type: TransactionType;
  amount: number;
  date: string; // ISO
  member: string;
  description: string;
};

export type GroupStatus = "Active" | "Pending" | "Inactive";
export type Group = {
  id: number;
  name: string;
  balance: number;
  goal: number;
  members: Member[];
  created: string; // ISO date
  status: GroupStatus;
  description: string;
  transactions: Transaction[];
};

export type VoteChoice = "yes" | "no";
export type VoteRecord = { member: string; vote: VoteChoice; timestamp: string };

export type BaseVote = {
  id: number;
  groupId: number;
  title: string;
  description: string;
  initiatedBy: string;
  dateInitiated: string; // ISO
  deadline: string;      // ISO
  requiredVotes: number;
  votes: VoteRecord[];
};

export type InviteVote = BaseVote & {
  type: "invite";
  details: { walletAddress: string; message?: string };
};

export type FundRequestVote = BaseVote & {
  type: "fund_request";
  details: { amount: number; purpose: string; notes?: string };
};

export type ActiveVote = InviteVote | FundRequestVote;

export type CompletedVote = (InviteVote | FundRequestVote) & {
  dateCompleted: string; // ISO
  result: "approved" | "rejected";
};
