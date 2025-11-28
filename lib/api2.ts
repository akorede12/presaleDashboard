

// import { PresaleTransaction, PresaleStats, WalletBalance } from '@/types/presale';
// import axios from 'axios';

// const API_BASE_URL = 'https://presale-j4ih.onrender.com/api';

// export const fetchPresaleTransactions = async (): Promise<PresaleTransaction[]> => {
//   const response = await axios.get(`${API_BASE_URL}/presale/transactions`);
//   return response.data;
// };

// export const fetchAllWalletBalances = async (): Promise<WalletBalance[]> => {
//   const transactions = await fetchPresaleTransactions();
//   const walletMap = new Map<string, PresaleTransaction[]>();

//   transactions.forEach(tx => {
//     const existing = walletMap.get(tx.wallet) || [];
//     walletMap.set(tx.wallet, [...existing, tx]);
//   });

//   return Array.from(walletMap.entries()).map(([wallet, txs]) => {
//     const totalAmountPaid = txs.reduce((sum, tx) => sum + tx.amountPaid, 0);
//     const totalTokensReceived = txs.reduce((sum, tx) => sum + tx.tokensReceived, 0);
//     const phases = Array.from(new Set(txs.map(tx => tx.phase)));

//     return {
//       wallet,
//       totalAmountPaid,
//       totalTokensReceived,
//       transactionCount: txs.length,
//       phases,
//     };
//   });
// };

// export const fetchTransactionStats = async (phase?: string) => {
//   const transactions = await fetchPresaleTransactions();

//   const filteredTransactions = phase
//     ? transactions.filter(tx => tx.phase === phase)
//     : transactions;

//   const totalAmountRaised = filteredTransactions.reduce((sum, tx) => sum + tx.amountPaid, 0);
//   const totalTokensDistributed = filteredTransactions.reduce((sum, tx) => sum + tx.tokensReceived, 0);
//   const uniqueWallets = new Set(filteredTransactions.map(tx => tx.wallet)).size;

//   return {
//     totalAmountRaised,
//     totalTokensDistributed,
//     totalTransactions: filteredTransactions.length,
//     uniqueWallets,
//   };
// };

// export const fetchTransactionById = async (id: string) => {
//   const response = await axios.get(`${API_BASE_URL}/presale/transactions/${id}`);
//   return response.data;
// };

// export const fetchTransactionsByWallet = async (wallet: string): Promise<PresaleTransaction[]> => {
//   const response = await axios.get(`${API_BASE_URL}/presale/transactions/wallet/${wallet}`);
//   return response.data;
// };

// export const fetchPresaleStats = async (): Promise<PresaleStats> => {
//   const transactions = await fetchPresaleTransactions();
//   const walletBalances = await fetchAllWalletBalances();

//   const totalAmountRaised = transactions.reduce((sum, tx) => sum + tx.amountPaid, 0);
//   const totalTokensDistributed = transactions.reduce((sum, tx) => sum + tx.tokensReceived, 0);
//   const uniqueWallets = new Set(transactions.map(tx => tx.wallet)).size;

//   const phases = Array.from(new Set(transactions.map(tx => tx.phase))).map(phaseName => {
//     const phaseTransactions = transactions.filter(tx => tx.phase === phaseName);
//     const phaseAmount = phaseTransactions.reduce((sum, tx) => sum + tx.amountPaid, 0);
//     const phaseTokens = phaseTransactions.reduce((sum, tx) => sum + tx.tokensReceived, 0);

//     return {
//       name: phaseName,
//       totalAmount: phaseAmount,
//       totalTokens: phaseTokens,
//       transactionCount: phaseTransactions.length,
//       uniqueWallets: new Set(phaseTransactions.map(tx => tx.wallet)).size,
//     };
//   });

//   // Get top 5 wallets by total amount paid
//   const topWallets = walletBalances
//     .sort((a, b) => b.totalAmountPaid - a.totalAmountPaid)
//     .slice(0, 5);

//   return {
//     totalAmountRaised,
//     totalTokensDistributed,
//     totalTransactions: transactions.length,
//     uniqueWallets,
//     phases,
//     topWallets,
//   };
// };

// export const fetchWalletBalance = async (wallet: string): Promise<WalletBalance> => {
//   const transactions = await fetchTransactionsByWallet(wallet);

//   const totalAmountPaid = transactions.reduce((sum, tx) => sum + tx.amountPaid, 0);
//   const totalTokensReceived = transactions.reduce((sum, tx) => sum + tx.tokensReceived, 0);
//   const phases = Array.from(new Set(transactions.map(tx => tx.phase)));

//   return {
//     wallet,
//     totalAmountPaid,
//     totalTokensReceived,
//     transactionCount: transactions.length,
//     phases,
//   };
// };


import { PresaleTransaction, PresaleStats, WalletBalance } from '@/types/presale';
import axios from 'axios';

const API_BASE_URL = 'https://presale-j4ih.onrender.com/api';

// Create axios instance with better error handling
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});


// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     console.error('API Error:', error.message, error.response?.status, error.response?.data);
//     throw error;
//   }
// );

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check for network errors specifically
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error' || !error.response) {
      console.warn('Network error detected, will use mock data:', error.message);
      // Create a custom error that we can catch specifically
      const networkError = new Error('NETWORK_FALLBACK');
      networkError.cause = error;
      throw networkError;
    } else {
      console.error('API Error:', error.message, error.response?.status, error.response?.data);
      throw error;
    }
  }
);

export const fetchPresaleTransactions = async (params?: {
  phase?: string;
  wallet?: string;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<PresaleTransaction[]> => {
  try {
    // Try the actual API first with proper parameters
    const response = await api.get('/presale/transactions', {
      params: {
        limit: params?.limit || 1000, // Increased limit to get all transactions
        offset: params?.offset || 0,
        phase: params?.phase,
        wallet: params?.wallet,
        status: params?.status,
      }
    });
    return response.data;
  } catch (error: any) {
    // Only show warning for network fallback, not for other errors
    if (error.message === 'NETWORK_FALLBACK') {
      console.warn('Using mock data due to network connectivity issues');
    } else {
      console.warn('API request failed, using mock data:', error.message);
    }
    // Fallback to mock data for development
    return mockTransactions;
  }
};

// Mock data for development since API has CORS issues
const mockTransactions: PresaleTransaction[] = [
  {
    // id: '1',
    phase: 'Phase 1',
    wallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
    amountPaid: 1000.5,
    tokensReceived: 50025,
    paymentCurrency: 'USDC',
    tokenRate: 0.02,
    metadata: {
      transactionHash: '0x1234567890abcdef',
      network: 'ethereum'
    },
    createdAt: new Date().toISOString(),
    // updatedAt: new Date().toISOString()
  },
  {
    // id: '2',
    phase: 'Phase 1',
    wallet: '0x89205A3a3b2A69De6Dbf7f01ED13B2108B2c43e7',
    amountPaid: 500.25,
    tokensReceived: 25012.5,
    paymentCurrency: 'ETH',
    tokenRate: 0.02,
    metadata: {
      transactionHash: '0xabcdef1234567890',
      network: 'ethereum'
    },
    createdAt: new Date().toISOString(),
    // updatedAt: new Date().toISOString()
  }
];

// export const fetchPresaleTransactions = async (): Promise<PresaleTransaction[]> => {
//   try {
//     // Try the actual API first
//     const response = await api.get('/presale/transactions');
//     return response.data;
//   } catch (error: any) {
//     console.warn('API request failed, using mock data:', error.message);
//     // Fallback to mock data for development
//     return mockTransactions;
//   }
// };



// export const fetchAllWalletBalances = async (): Promise<WalletBalance[]> => {
//   try {
//     const transactions = await fetchPresaleTransactions();
//     const walletMap = new Map<string, PresaleTransaction[]>();

//     transactions.forEach(tx => {
//       const existing = walletMap.get(tx.wallet) || [];
//       walletMap.set(tx.wallet, [...existing, tx]);
//     });

//     return Array.from(walletMap.entries()).map(([wallet, txs]) => {
//       const totalAmountPaid = txs.reduce((sum, tx) => sum + tx.amountPaid, 0);
//       const totalTokensReceived = txs.reduce((sum, tx) => sum + tx.tokensReceived, 0);
//       const phases = Array.from(new Set(txs.map(tx => tx.phase)));

//       return {
//         wallet,
//         totalAmountPaid,
//         totalTokensReceived,
//         transactionCount: txs.length,
//         phases,
//       };
//     });
//   } catch (error) {
//     console.error('Error fetching wallet balances:', error);
//     return [];
//   }
// };


// Update other functions that use fetchPresaleTransactions to maintain compatibility
export const fetchAllWalletBalances = async (): Promise<WalletBalance[]> => {
  try {
    const transactions = await fetchPresaleTransactions({ limit: 1000 });
    const walletMap = new Map<string, PresaleTransaction[]>();

    transactions.forEach(tx => {
      const existing = walletMap.get(tx.wallet) || [];
      walletMap.set(tx.wallet, [...existing, tx]);
    });

    return Array.from(walletMap.entries()).map(([wallet, txs]) => {
      const totalAmountPaid = txs.reduce((sum, tx) => sum + tx.amountPaid, 0);
      const totalTokensReceived = txs.reduce((sum, tx) => sum + tx.tokensReceived, 0);
      const phases = Array.from(new Set(txs.map(tx => tx.phase)));

      return {
        wallet,
        totalAmountPaid,
        totalTokensReceived,
        transactionCount: txs.length,
        phases,
      };
    });
  } catch (error) {
    console.error('Error fetching wallet balances:', error);
    return [];
  }
};

export const fetchTransactionStats = async (phase?: string) => {
  try {
    const transactions = await fetchPresaleTransactions();

    const filteredTransactions = phase
      ? transactions.filter(tx => tx.phase === phase)
      : transactions;

    const totalAmountRaised = filteredTransactions.reduce((sum, tx) => sum + tx.amountPaid, 0);
    const totalTokensDistributed = filteredTransactions.reduce((sum, tx) => sum + tx.tokensReceived, 0);
    const uniqueWallets = new Set(filteredTransactions.map(tx => tx.wallet)).size;

    return {
      totalAmountRaised,
      totalTokensDistributed,
      totalTransactions: filteredTransactions.length,
      uniqueWallets,
    };
  } catch (error) {
    console.error('Error fetching transaction stats:', error);
    return {
      totalAmountRaised: 0,
      totalTokensDistributed: 0,
      totalTransactions: 0,
      uniqueWallets: 0,
    };
  }
};

export const fetchTransactionById = async (id: string) => {
  try {
    const response = await api.get(`/presale/transactions/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching transaction by ID:', error);
    throw error;
  }
};

// export const fetchTransactionsByWallet = async (wallet: string): Promise<PresaleTransaction[]> => {
//   try {
//     const response = await api.get(`/presale/transactions/wallet/${wallet}`);
//     return response.data;
//   } catch (error) {
//     console.error('Error fetching transactions by wallet:', error);
//     // Fallback: filter from all transactions
//     const allTransactions = await fetchPresaleTransactions();
//     return allTransactions.filter(tx => tx.wallet.toLowerCase() === wallet.toLowerCase());
//   }
// };

export const fetchTransactionsByWallet = async (wallet: string): Promise<PresaleTransaction[]> => {
  try {
    const response = await api.get(`/presale/transactions/wallet/${wallet}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching transactions by wallet:', error);
    // Fallback: filter from all transactions using the new parameter approach
    const allTransactions = await fetchPresaleTransactions({ wallet, limit: 1000 });
    return allTransactions.filter(tx => tx.wallet.toLowerCase() === wallet.toLowerCase());
  }
};



export const fetchPresaleStats = async (): Promise<PresaleStats> => {
  try {
    const transactions = await fetchPresaleTransactions();
    const walletBalances = await fetchAllWalletBalances();

    const totalAmountRaised = transactions.reduce((sum, tx) => sum + tx.amountPaid, 0);
    const totalTokensDistributed = transactions.reduce((sum, tx) => sum + tx.tokensReceived, 0);
    const uniqueWallets = new Set(transactions.map(tx => tx.wallet)).size;

    const phases = Array.from(new Set(transactions.map(tx => tx.phase))).map(phaseName => {
      const phaseTransactions = transactions.filter(tx => tx.phase === phaseName);
      const phaseAmount = phaseTransactions.reduce((sum, tx) => sum + tx.amountPaid, 0);
      const phaseTokens = phaseTransactions.reduce((sum, tx) => sum + tx.tokensReceived, 0);

      return {
        name: phaseName,
        totalAmount: phaseAmount,
        totalTokens: phaseTokens,
        transactionCount: phaseTransactions.length,
        uniqueWallets: new Set(phaseTransactions.map(tx => tx.wallet)).size,
      };
    });

    const topWallets = walletBalances
      .sort((a, b) => b.totalAmountPaid - a.totalAmountPaid)
      .slice(0, 5);

    return {
      totalAmountRaised,
      totalTokensDistributed,
      totalTransactions: transactions.length,
      uniqueWallets,
      phases,
      topWallets,
    };
  } catch (error) {
    console.error('Error fetching presale stats:', error);
    return {
      totalAmountRaised: 0,
      totalTokensDistributed: 0,
      totalTransactions: 0,
      uniqueWallets: 0,
      phases: [],
      topWallets: [],
    };
  }
};

export const fetchWalletBalance = async (wallet: string): Promise<WalletBalance> => {
  try {
    const transactions = await fetchTransactionsByWallet(wallet);

    const totalAmountPaid = transactions.reduce((sum, tx) => sum + tx.amountPaid, 0);
    const totalTokensReceived = transactions.reduce((sum, tx) => sum + tx.tokensReceived, 0);
    const phases = Array.from(new Set(transactions.map(tx => tx.phase)));

    return {
      wallet,
      totalAmountPaid,
      totalTokensReceived,
      transactionCount: transactions.length,
      phases,
    };
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    return {
      wallet,
      totalAmountPaid: 0,
      totalTokensReceived: 0,
      transactionCount: 0,
      phases: [],
    };
  }
};