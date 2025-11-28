'use client';

import { useQuery } from '@tanstack/react-query';
import { AdminNavigation } from '@/components/wallet/AdminNavigation';
import { presaleContract } from '@/lib/contract';
import { ethers } from "ethers";
import { formatCurrency, formatNumber } from '@/lib/utils';


export default function AdminTransactionsPage() {
  const { data: phases = [], isLoading } = useQuery({
    queryKey: ['all-phases'],
    queryFn: () => presaleContract.getAllPhases(),
  });

  // Get presale info for total funds raised
  const { data: presaleInfo } = useQuery({
    queryKey: ['presale-info'],
    queryFn: () => presaleContract.getPresaleInfo(),
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto">
        <div className="px-8 pt-8">
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Transactions</h1>
            {presaleInfo && (
              // <div className="mt-2 text-lg text-gray-600 dark:text-gray-400">
              //   Total Raised: ${(Number(presaleInfo.amountRaised) / 1e6).toFixed(2)} USDC
              // </div>
              <div className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                Total Raised: {formatCurrency(presaleInfo.amountRaised)}  USDC
              </div>
            )}
          </div>
        </div>

        <AdminNavigation />

        <div className="px-8 pb-8">
          {isLoading ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading...</div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Phase Summaries</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left p-2">Phase</th>
                      <th className="text-left p-2">Amount Raised</th>
                      <th className="text-left p-2">Tokens Sold</th>
                      <th className="text-left p-2">Start Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {phases.map((phase) => (
                      <tr key={phase.index} className="border-t">
                        <td className="p-2">{phase.name}</td>
                        {/* <td className="p-2">${(Number(phase.fundsRaised) / 1e6).toFixed(2)}</td>
                        <td className="p-2">{ethers.formatUnits(phase.tokensSold)}</td> */}
                        <td className="p-2">{formatCurrency(phase.fundsRaised)}</td>
                        <td className="p-2">{formatNumber(phase.tokensSold)}</td>
                        <td className="p-2">
                          {new Date(Number(phase.startTime) * 1000).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                Note: Individual transaction data requires backend event tracking
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
