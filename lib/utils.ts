// import { format } from 'date-fns';

export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// export function formatCurrency(amount: number, currency: string = 'USD'): string {
//   return new Intl.NumberFormat('en-US', {
//     style: 'currency',
//     currency,
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2,
//   }).format(amount);
// }

export const formatCurrency = (value: number, currency: string = 'USD'): string => {
  // Handle invalid currency codes by falling back to USD
  const safeCurrency = isValidCurrency(currency) ? currency : 'USD';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: safeCurrency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

// Helper function to validate currency codes
const isValidCurrency = (currency: string): boolean => {
  try {
    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency });
    return formatter.format(1) !== '1';
  } catch {
    return false;
  }
};

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

// export function formatDate(date: string | Date): string {
//   return format(new Date(date), 'MMM dd, yyyy HH:mm');
// }

export function calculateStats(transactions: Array<{ amountPaid: number; tokensReceived: number }>) {
  const totalAmount = transactions.reduce((sum, tx) => sum + tx.amountPaid, 0);
  const totalTokens = transactions.reduce((sum, tx) => sum + tx.tokensReceived, 0);

  return {
    totalAmount,
    totalTokens,
    transactionCount: transactions.length,
    averageAmount: transactions.length > 0 ? totalAmount / transactions.length : 0,
    averageTokens: transactions.length > 0 ? totalTokens / transactions.length : 0,
  };
}

