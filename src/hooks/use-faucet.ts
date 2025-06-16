import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ContractService } from '@/lib/contractService';

export const useFaucet = () => {
  const { address, isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [timeUntilNextClaim, setTimeUntilNextClaim] = useState<number>(0);
  const [faucetAmount, setFaucetAmount] = useState<string>('1000.00');
  const [contractService] = useState(() => new ContractService());

  // Check cooldown time (disabled for testing)
  useEffect(() => {
    if (isConnected && address) {
      getFaucetInfo();
    }
  }, [isConnected, address]);

  const getFaucetInfo = async () => {
    if (!address) return;
    
    try {
      await contractService.initialize();
      const amount = await contractService.getFaucetAmount();
      
      setTimeUntilNextClaim(0); // No cooldown
      setFaucetAmount(amount);
    } catch (error) {
      console.warn('Failed to get faucet info:', error);
    }
  };

  const claimFaucet = async (): Promise<{ success: boolean; message: string; txHash?: string }> => {
    if (!isConnected || !address) {
      return { success: false, message: 'Please connect your wallet first' };
    }

    setIsLoading(true);
    
    try {
      await contractService.initialize();
      const tx = await contractService.claimFaucet();
      
      // No cooldown - can claim again immediately
      setTimeUntilNextClaim(0);
      
      return { 
        success: true, 
        message: `Successfully claimed ${faucetAmount} USDC!`,
        txHash: tx.hash 
      };
    } catch (error: any) {
      console.error('Faucet claim failed:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to claim faucet tokens' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeRemaining = (seconds: number): string => {
    if (seconds <= 0) return '';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  return {
    claimFaucet,
    isLoading,
    timeUntilNextClaim: 0, // No cooldown
    faucetAmount,
    canClaim: isConnected, // Can always claim when connected
    formatTimeRemaining: () => '', // No time remaining
    isConnected
  };
};
