// appkit.ts - Reown AppKit integration
import { optimismSepolia } from '@reown/appkit/networks';
import { appKit } from './AppKitProvider';

// Export the network for reference elsewhere
export const OPTIMISM_SEPOLIA = optimismSepolia;

// Connect wallet using Reown AppKit
export async function connectWallet() {
  try {
    // Open the modal to connect wallet and switch to Optimism Sepolia
    await appKit.open({
      view: 'Connect',
      namespace: 'eip155' // For Ethereum-based chains
    });
    
    // Get the connection details from the adapter
    const provider = await appKit.getProvider({ chainId: optimismSepolia.id });
    const address = await appKit.getAddress({ chainId: optimismSepolia.id });
    
    return {
      account: address,
      provider: provider
    };
  } catch (error: unknown) {
    console.error('Failed to connect wallet:', error);
    throw error;
  }
}
