'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function AdminNavigation() {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/wallet' },
    { name: 'Wallets', href: '/wallet/wallets' },
    { name: 'Transactions', href: '/wallet/transactions' },
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 mb-6">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex space-x-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`inline-flex items-center px-1 pt-4 pb-4 text-sm font-medium border-b-2 transition-colors ${pathname === item.href
                ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}