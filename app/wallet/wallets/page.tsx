'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchAllWalletBalances } from '@/lib/api2';
import { AdminNavigation } from '@/components/wallet/AdminNavigation';
import { formatAddress, formatCurrency, formatNumber } from '@/lib/utils';
import { WalletBalance } from '@/types/presale';
import Link from 'next/link';
import { useState } from 'react';

export default function AdminWalletsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: walletBalances = [], isLoading } = useQuery({
    queryKey: ['all-wallet-balances'],
    queryFn: () => fetchAllWalletBalances(),
  });

  const filteredWallets = walletBalances.filter((wallet: WalletBalance) =>
    wallet.wallet.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedWallets = [...filteredWallets].sort(
    (a, b) => b.totalAmountPaid - a.totalAmountPaid
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto">
        <div className="px-8 pt-8">
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Wallets</h1>
          </div>
        </div>
        <AdminNavigation />
        <div className="px-8 pb-8">
          {isLoading ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading...</div>
          ) : (
            <>
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Search by wallet address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full max-w-md px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Wallet Address
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Total Amount Paid
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Total Tokens Received
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Transactions
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Phases
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {sortedWallets.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                            No wallets found
                          </td>
                        </tr>
                      ) : (
                        sortedWallets.map((wallet: WalletBalance) => (
                          <tr
                            key={wallet.wallet}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-mono text-sm text-gray-900 dark:text-gray-100">
                                {wallet.wallet}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {formatCurrency(wallet.totalAmountPaid)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-gray-100">
                                {formatNumber(wallet.totalTokensReceived)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {wallet.transactionCount}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {wallet.phases.join(', ')}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Link
                                href={`/admin/wallet/transactions?wallet=${encodeURIComponent(wallet.wallet)}`}
                                className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                              >s
                                View Transactions
                              </Link>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Showing {sortedWallets.length} of {walletBalances.length} wallets
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

