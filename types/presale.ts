// export interface PresaleTransaction {
//   phase: string;
//   wallet: string;
//   amountPaid: number;
//   tokensReceived: number;
//   paymentCurrency: string;
//   tokenRate: number;
//   createdAt: string | Date;
//   metadata: Record<string, unknown>;
// }
// types/presale.ts
export interface PresaleTransaction {
  id: string;
  wallet: string;
  phase: string;
  amountPaid: number;
  tokensReceived: number;
  paymentCurrency: string;
  createdAt: string;
  transactionHash?: string;
  tokenRate?: number; // Make this optional since we don't have it from contract
  metadata?: any; // Make this optional
}

export interface Phase {
  name: string;
  totalAmount: number;
  totalTokens: number;
  transactionCount: number;
  uniqueWallets: number;
  completed?: boolean;
  withdrawn?: boolean;
  index?: number;
}

export interface WalletBalance {
  wallet: string;
  totalAmountPaid: number;
  totalTokensReceived: number;
  transactionCount: number;
  phases: string[];
}
export interface Phase {
  name: string;
  totalAmount: number;
  totalTokens: number;
  transactionCount: number;
  uniqueWallets: number;
}

export interface WalletBalance {
  wallet: string;
  totalAmountPaid: number;
  totalTokensReceived: number;
  transactionCount: number;
  phases: string[];
}

export interface PresaleStats {
  totalAmountRaised: number;
  totalTokensDistributed: number;
  totalTransactions: number;
  uniqueWallets: number;
  phases: Phase[];
  topWallets: WalletBalance[];
}

export type UserRole = 'user' | 'admin';

