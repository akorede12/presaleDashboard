'use client';

import { WagmiProvider, createConfig, http } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { injected, walletConnect } from 'wagmi/connectors';

const projectId = 'dc598008494e4cd02b41cf4a4142938d';

// Create Wagmi config without RainbowKit
const config = createConfig({
    chains: [base, baseSepolia],
    connectors: [
        injected(), // This handles MetaMask, Phantom, Trust Wallet, etc.
        walletConnect({
            projectId: projectId,
            showQrModal: true, // WalletConnect will handle its own modal
        }),
    ],
    transports: {
        [base.id]: http('https://base-mainnet.g.alchemy.com/v2/8xazORMwB9_CO0TTLYG2a'),
        [baseSepolia.id]: http('https://base-sepolia.g.alchemy.com/v2/8xazORMwB9_CO0TTLYG2a'),
    },
    ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    );
}