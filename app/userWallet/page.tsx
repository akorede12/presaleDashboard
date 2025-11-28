'use client';

import { useConnect, useAccount, useDisconnect } from 'wagmi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { WalletConnect } from '@/components/wallet/WalletConnect';
import { TransactionTable } from '@/components/wallet/TransactionTable';
import { StatsCard } from '@/components/wallet/StatsCard';
import { PhaseCard } from '@/components/wallet/PhaseCard';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { userPresaleContract } from '@/lib/userContract';
import { useState } from 'react';

export default function UserDashboard() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const queryClient = useQueryClient();

  const [isAttemptingConnection, setIsAttemptingConnection] = useState(false);
  const [buyAmount, setBuyAmount] = useState('');
  const [buyCurrency, setBuyCurrency] = useState<'ETH' | 'USDC'>('ETH');
  const [isBuying, setIsBuying] = useState(false);

  // demo data 

  const { data: userData, isLoading: userDataLoading } = useQuery({
    queryKey: ['user-presale-data', address],
    queryFn: () => ({
      usdcAmount: 1250.75,
      salamAmount: 125075
    }),
    enabled: !!address && isConnected,
  });

  const { data: presaleInfo, isLoading: presaleInfoLoading } = useQuery({
    queryKey: ['presale-info'],
    queryFn: () => ({
      amountRaised: 2850000,
      totalHardCap: 5000000
    }),
    enabled: isConnected,
  });

  const { data: currentPhase, isLoading: phaseLoading } = useQuery({
    queryKey: ['current-phase'],
    queryFn: () => ({
      name: "Phase 3",
      pricePerToken: 0.01
    }),
    enabled: isConnected,
  });

  const { data: allPhases = [], isLoading: phasesLoading } = useQuery({
    queryKey: ['all-phases'],
    queryFn: () => [
      { name: "Phase 1", index: 0, startTime: 1633046400, endTime: 1635652800 },
      { name: "Phase 2", index: 1, startTime: 1635652800, endTime: 1638254400 },
      { name: "Phase 3", index: 2, startTime: 1638254400, endTime: 1640932800 }
    ],
    enabled: isConnected,
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ['transaction-history', address],
    queryFn: () => [
      {
        transactionHash: "0x1a2b3c4d5e6f7890abcdef1234567890",
        buyer: address,
        amountPaid: 500.25,
        tokensReceived: 50025,
        tokenId: 1,
        timestamp: 1635678900
      },
      {
        transactionHash: "0x2b3c4d5e6f7890abcdef12345678901",
        buyer: address,
        amountPaid: 750.50,
        tokensReceived: 75050,
        tokenId: 0,
        timestamp: 1638345600
      }
    ],
    enabled: !!address && isConnected,
  });

  const { data: walletBalances, isLoading: balancesLoading } = useQuery({
    queryKey: ['wallet-balances', address],
    queryFn: () => ({
      ethBalance: 2.5,
      usdcBalance: 1500
    }),
    enabled: !!address && isConnected,
  });

  // Convert transaction events to TransactionTable format
  const formattedTransactions = transactions.map((tx, index) => ({
    id: tx.transactionHash || `tx-${index}`,
    wallet: tx.buyer || address || '0x0000000000000000000000000000000000000000',
    phase: `Phase ${(allPhases.find(p =>
      tx.timestamp >= p.startTime && tx.timestamp <= p.endTime
    )?.index || 0) + 1}`,
    amountPaid: tx.amountPaid || 0,
    tokensReceived: tx.tokensReceived || 0,
    paymentCurrency: tx.tokenId === 1 ? 'USDC' : 'ETH',
    createdAt: new Date((tx.timestamp || Date.now() / 1000) * 1000).toISOString(),
    transactionHash: tx.transactionHash || `demo-hash-${index}`
  }));



  //

  // User presale data
  // const { data: userData, isLoading: userDataLoading } = useQuery({
  //   queryKey: ['user-presale-data', address],
  //   queryFn: () => userPresaleContract.getUserPresaleData(address!),
  //   enabled: !!address && isConnected,
  // });

  // Presale info
  // const { data: presaleInfo, isLoading: presaleInfoLoading } = useQuery({
  //   queryKey: ['presale-info'],
  //   queryFn: () => userPresaleContract.getPresaleInfo(),
  //   enabled: isConnected,
  // });

  // Current phase info
  // const { data: currentPhase, isLoading: phaseLoading } = useQuery({
  //   queryKey: ['current-phase'],
  //   queryFn: () => userPresaleContract.getCurrentPhaseInfo(),
  //   enabled: isConnected,
  // });

  // All phases
  // const { data: allPhases = [], isLoading: phasesLoading } = useQuery({
  //   queryKey: ['all-phases'],
  //   queryFn: () => userPresaleContract.getAllPhases(),
  //   enabled: isConnected,
  // });

  // Transaction history
  // const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
  //   queryKey: ['transaction-history', address],
  //   queryFn: () => userPresaleContract.getTransactionHistory(address!),
  //   enabled: !!address && isConnected,
  // });

  // Wallet balances
  // const { data: walletBalances, isLoading: balancesLoading } = useQuery({
  //   queryKey: ['wallet-balances', address],
  //   queryFn: () => userPresaleContract.getWalletBalances(address!),
  //   enabled: !!address && isConnected,
  // });

  // Buy mutation
  const buyMutation = useMutation({
    mutationFn: async ({ amount, currency }: { amount: number; currency: 'ETH' | 'USDC' }) => {
      if (currency === 'ETH') {
        return await userPresaleContract.buyWithETH(amount);
      } else {
        return await userPresaleContract.buyWithUSDC(amount);
      }
    },
    onSuccess: () => {
      // Invalidate all relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['user-presale-data'] });
      queryClient.invalidateQueries({ queryKey: ['presale-info'] });
      queryClient.invalidateQueries({ queryKey: ['current-phase'] });
      queryClient.invalidateQueries({ queryKey: ['transaction-history'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-balances'] });
      setBuyAmount('');
      setIsBuying(false);
    },
    onError: (error) => {
      console.error('Buy failed:', error);
      setIsBuying(false);
    }
  });

  const handleBuy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyAmount || isNaN(parseFloat(buyAmount))) return;

    setIsBuying(true);
    buyMutation.mutate({
      amount: parseFloat(buyAmount),
      currency: buyCurrency
    });
  };

  const handleWalletConnect = async (walletId: string) => {
    if (isAttemptingConnection) return;

    setIsAttemptingConnection(true);

    try {
      const connectorMap: { [key: string]: string } = {
        metaMask: 'io.metamask',
        trustWallet: 'injected',
        phantom: 'injected',
        walletConnect: 'walletConnect'
      };

      const connectorId = connectorMap[walletId];
      const connector = connectors.find(c => c.id === connectorId);

      if (!connector) {
        console.error('Wallet connector not found');
        setIsAttemptingConnection(false);
        return;
      }

      // Special handling for Phantom when MetaMask is present
      if (walletId === "phantom" && window.ethereum?.isMetaMask && !(window as any).phantom?.ethereum) {
        console.log('Please open Phantom app or disable MetaMask to connect');
        setIsAttemptingConnection(false);
        return;
      }

      connect({ connector }, {
        onError: (error: any) => {
          console.error("Connection error:", error);
          disconnect();
          setIsAttemptingConnection(false);
        },
        onSuccess: () => {
          setIsAttemptingConnection(false);
        }
      });

    } catch (error: any) {
      console.error("Connection error:", error);
      disconnect();
      setIsAttemptingConnection(false);
    }
  };

  // Convert transaction events to TransactionTable format
  // const formattedTransactions = transactions.map((tx, index) => ({
  //   id: tx.transactionHash,
  //   wallet: tx.buyer,
  //   phase: `Phase ${allPhases.find(p =>
  //     tx.timestamp >= p.startTime && tx.timestamp <= p.endTime
  //   )?.index || 0 + 1}`,
  //   amountPaid: tx.amountPaid,
  //   tokensReceived: tx.tokensReceived,
  //   paymentCurrency: tx.tokenId === 1 ? 'USDC' : 'ETH',
  //   createdAt: new Date(tx.timestamp * 1000).toISOString(),
  //   transactionHash: tx.transactionHash
  // }));

  // Calculate user's phases participated
  const userPhases = allPhases.filter(phase => {
    const phaseTransactions = formattedTransactions.filter(tx => tx.phase === phase.name);
    return phaseTransactions.length > 0;
  }).map(phase => {
    const phaseTransactions = formattedTransactions.filter(tx => tx.phase === phase.name);
    const totalAmount = phaseTransactions.reduce((sum, tx) => sum + tx.amountPaid, 0);
    const totalTokens = phaseTransactions.reduce((sum, tx) => sum + tx.tokensReceived, 0);

    return {
      name: phase.name,
      totalAmount,
      totalTokens,
      transactionCount: phaseTransactions.length,
      uniqueWallets: 1,
    };
  });

  const isLoading = userDataLoading || presaleInfoLoading || phaseLoading || transactionsLoading || balancesLoading;

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-40">
        <div className="max-w-7xl mx-auto p-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              User Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please connect your wallet to view your presale information
            </p>

            {/* Wallet Connection Buttons */}
            <div className="space-y-3 max-w-md mx-auto">
              {/* WalletConnect */}
              <button
                type="button"
                onClick={() => handleWalletConnect("walletConnect")}
                disabled={isAttemptingConnection}
                className="w-full p-4 rounded-3xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 flex items-center justify-between transition-colors disabled:opacity-50 px-6"
              >
                <div className='flex gap-4 items-center'>
                  <img
                    src={'/wc.svg'}
                    width={24}
                    height={24}
                    alt="WalletConnect"
                  />
                  <span className="font-semibold">Wallet Connect</span>
                </div>
                <div>
                  <img
                    src={'/ArrowSquareOut2.svg'}
                    width={24}
                    height={24}
                    alt="Connect"
                  />
                </div>
              </button>

              {/* Trust Wallet */}
              <button
                type="button"
                onClick={() => handleWalletConnect("trustWallet")}
                disabled={isAttemptingConnection}
                className="w-full p-4 rounded-3xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 flex items-center justify-between transition-colors disabled:opacity-50 px-6"
              >
                <div className='flex gap-4 items-center'>
                  <img
                    src={'/Trust_Core.svg'}
                    width={26}
                    height={30}
                    alt="Trust Wallet"
                  />
                  <span className="font-semibold">Trust Wallet</span>
                </div>
                <div>
                  <img
                    src={'/ArrowSquareOut2.svg'}
                    width={24}
                    height={24}
                    alt="Connect"
                  />
                </div>
              </button>

              {/* MetaMask */}
              <button
                type="button"
                onClick={() => handleWalletConnect("metaMask")}
                disabled={isAttemptingConnection}
                className="w-full p-4 rounded-3xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 flex items-center justify-between transition-colors disabled:opacity-50 px-6"
              >
                <div className='flex gap-4 items-center'>
                  <img
                    src={'/MetaMask.svg'}
                    width={24}
                    height={24}
                    alt="MetaMask"
                  />
                  <span className="font-semibold">MetaMask</span>
                </div>
                <div>
                  <img
                    src={'/ArrowSquareOut2.svg'}
                    width={24}
                    height={24}
                    alt="Connect"
                  />
                </div>
              </button>

              {/* Phantom */}
              <button
                type="button"
                onClick={() => handleWalletConnect("phantom")}
                disabled={isAttemptingConnection}
                className="w-full p-4 rounded-3xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 flex items-center justify-between transition-colors disabled:opacity-50 px-6"
              >
                <div className='flex gap-4 items-center'>
                  <img
                    src={'/Phantom.svg'}
                    width={24}
                    height={24}
                    alt="Phantom"
                  />
                  <span className="font-semibold">Phantom</span>
                </div>
                <div>
                  <img
                    src={'/ArrowSquareOut2.svg'}
                    width={24}
                    height={24}
                    alt="Connect"
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-40">
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">User Dashboard</h1>
          <WalletConnect />
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading...</div>
        ) : (
          <>
            {/* Presale Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Presale Overview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Total Raised</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {formatCurrency(presaleInfo?.amountRaised || 0)} / {formatCurrency(presaleInfo?.totalHardCap || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Current Phase</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {currentPhase?.name} - ${currentPhase?.pricePerToken?.toFixed(4)} per token
                  </p>
                </div>
              </div>
            </div>

            {/* Buy Tokens Section */}
            {/* <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Buy Tokens
              </h2>
              <form onSubmit={handleBuy} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Amount</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={buyAmount}
                    onChange={(e) => setBuyAmount(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder={`Enter ${buyCurrency} amount`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Currency</label>
                  <select
                    value={buyCurrency}
                    onChange={(e) => setBuyCurrency(e.target.value as 'ETH' | 'USDC')}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="ETH">ETH</option>
                    <option value="USDC">USDC</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={isBuying || !buyAmount}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                  >
                    {isBuying ? 'Buying...' : 'Buy Tokens'}
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Your Balance</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {buyCurrency === 'ETH'
                      ? `${walletBalances?.ethBalance.toFixed(4)} ETH`
                      : `${formatCurrency(walletBalances?.usdcBalance || 0)} USDC`
                    }
                  </p>
                </div>
              </form>
            </div> */}

            {/* User Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatsCard
                title="Total Amount Paid"
                value={userData ? formatCurrency(userData.usdcAmount) : '$0.00'}
              />
              <StatsCard
                title="Total Tokens Received"
                value={userData ? formatNumber(userData.salamAmount) : '0'}
              />
              <StatsCard
                title="Total Transactions"
                value={formattedTransactions.length}
              />
            </div>

            {/* Phases Participated */}
            {userPhases.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Phases Participated
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userPhases.map((phase) => (
                    <PhaseCard key={phase.name} phase={phase} />
                  ))}
                </div>
              </div>
            )}

            {/* Transaction History */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Transaction History ({formattedTransactions.length} transactions)
              </h2>
              <TransactionTable transactions={formattedTransactions} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}