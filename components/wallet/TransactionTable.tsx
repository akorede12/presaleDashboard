'use client';

import { PresaleTransaction } from '@/types/presale';
import { formatAddress, formatCurrency, formatNumber } from '@/lib/utils';
import { format } from 'date-fns';

interface TransactionTableProps {
  transactions: PresaleTransaction[];
  showWallet?: boolean;
  compact?: boolean;
}

function formatCompactDate(date: string | Date): string {
  return format(new Date(date), 'MMM dd, HH:mm');
}

export function TransactionTable({ transactions, showWallet = false, compact = false }: TransactionTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        No transactions found
      </div>
    );
  }

  const paddingY = compact ? 'py-1.5' : 'py-2';
  const paddingX = compact ? 'px-3' : 'px-4';
  const textSize = compact ? 'text-xs' : 'text-sm';

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            {showWallet && (
              <th className={`${paddingX} ${paddingY} text-left ${textSize} font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap`}>
                Wallet
              </th>
            )}
            <th className={`${paddingX} ${paddingY} text-left ${textSize} font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap`}>
              Phase
            </th>
            <th className={`${paddingX} ${paddingY} text-left ${textSize} font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap`}>
              Amount Paid
            </th>
            <th className={`${paddingX} ${paddingY} text-left ${textSize} font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap`}>
              Tokens Received
            </th>
            <th className={`${paddingX} ${paddingY} text-left ${textSize} font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap`}>
              Rate
            </th>
            <th className={`${paddingX} ${paddingY} text-left ${textSize} font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap`}>
              Currency
            </th>
            <th className={`${paddingX} ${paddingY} text-left ${textSize} font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap`}>
              Date
            </th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx, index) => (
            <tr
              key={index}
              className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {showWallet && (
                <td className={`${paddingX} ${paddingY} ${textSize} font-mono text-gray-600 dark:text-gray-400 whitespace-nowrap`}>
                  {formatAddress(tx.wallet)}
                </td>
              )}
              <td className={`${paddingX} ${paddingY} ${textSize} text-gray-900 dark:text-gray-100 whitespace-nowrap`}>
                {tx.phase}
              </td>
              <td className={`${paddingX} ${paddingY} ${textSize} text-gray-900 dark:text-gray-100 whitespace-nowrap`}>
                {formatCurrency(tx.amountPaid, tx.paymentCurrency)}
              </td>
              <td className={`${paddingX} ${paddingY} ${textSize} text-gray-900 dark:text-gray-100 whitespace-nowrap`}>
                {formatNumber(tx.tokensReceived)}
              </td>
              {/* <td className={`${paddingX} ${paddingY} ${textSize} text-gray-600 dark:text-gray-400 whitespace-nowrap`}>
                {tx.tokenRate.toFixed(6)}
              </td> */}
              <td className={`${paddingX} ${paddingY} ${textSize} text-gray-600 dark:text-gray-400 whitespace-nowrap`}>
                {((tx.tokenRate || tx.amountPaid / tx.tokensReceived) || 0).toFixed(6)}
              </td>
              <td className={`${paddingX} ${paddingY} ${textSize} text-gray-600 dark:text-gray-400 whitespace-nowrap`}>
                {tx.paymentCurrency}
              </td>
              <td className={`${paddingX} ${paddingY} ${textSize} text-gray-600 dark:text-gray-400 whitespace-nowrap`}>
                {compact ? formatCompactDate(tx.createdAt) : (tx.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

