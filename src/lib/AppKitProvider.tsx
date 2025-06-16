import React from 'react';
import { createAppKit } from '@reown/appkit/react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { optimismSepolia } from 'wagmi/chains';

// 0. Setup queryClient
const queryClient = new QueryClient();

// 1. Get projectId from https://cloud.reown.com
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID';

// 2. Create a metadata object - optional
const metadata = {
  name: 'MangroveMatrix',
  description: 'AI-Enhanced Mangrove Restoration Platform',
  url: 'https://mangrovematrix.com', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/179229932']
};

// 3. Define networks - using only OP Sepolia testnet
const networks = [optimismSepolia];

// 4. Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  networks: [optimismSepolia],
  projectId,
  ssr: false
});

// 5. Create the AppKit instance
export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  networks: [optimismSepolia],
  projectId,
  metadata,
  features: {
    analytics: true
  }
});

// Export wagmi config for use in other parts of the app
export const wagmiConfig = wagmiAdapter.wagmiConfig;

// AppKitProvider component
export function AppKitProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
