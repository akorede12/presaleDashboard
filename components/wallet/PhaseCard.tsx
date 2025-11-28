// components/wallet/PhaseCard.tsx
import { formatCurrency, formatNumber } from '@/lib/utils';

interface PhaseCardProps {
  phase: {
    name: string;
    totalAmount: number;
    totalTokens: number;
    transactionCount: number;
    uniqueWallets: number;
    completed?: boolean;
    withdrawn?: boolean;
    index?: number;
  };
  onWithdraw?: () => void;
  withdrawLoading?: boolean;
}

export function PhaseCard({ phase, onWithdraw, withdrawLoading }: PhaseCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {phase.name}
        </h3>
        <div className="flex gap-2">
          {phase.completed && !phase.withdrawn && onWithdraw && (
            <button
              onClick={onWithdraw}
              disabled={withdrawLoading}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {withdrawLoading ? 'Withdrawing...' : 'Withdraw'}
            </button>
          )}
          {phase.withdrawn && (
            <span className="px-3 py-1 bg-green-500 text-white text-sm rounded">
              Withdrawn
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Amount Raised:</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {formatCurrency(phase.totalAmount)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Tokens Sold:</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {formatNumber(phase.totalTokens)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Transactions:</span>
          <span className="text-gray-900 dark:text-gray-100">{phase.transactionCount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Unique Wallets:</span>
          <span className="text-gray-900 dark:text-gray-100">{phase.uniqueWallets}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Status:</span>
          <span className={`font-semibold ${phase.completed ? 'text-green-500' : 'text-yellow-500'
            }`}>
            {phase.completed ? 'Completed' : 'Active'}
          </span>
        </div>
      </div>
    </div>
  );
}
