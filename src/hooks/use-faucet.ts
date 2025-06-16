import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ContractService } from '@/lib/contractService';

export const useFaucet = () => {
  const { address, isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [timeUntilNextClaim, setTimeUntilNextClaim] = useState<number>(0);
  const [faucetAmount, setFaucetAmount] = useState<string>('1000.00');
  const [contractService] = useState(() => new ContractService());

  // Check cooldown time
  useEffect(() => {
    if (isConnected && address) {
      checkCooldown();
      
      // Set up interval to update countdown
      const interval = setInterval(() => {
        setTimeUntilNextClaim(prev => Math.max(0, prev - 1));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isConnected, address]);

  const checkCooldown = async () => {
    if (!address) return;
    
    try {
      await contractService.initialize();
      const timeLeft = await contractService.getTimeUntilNextClaim(address);
      const amount = await contractService.getFaucetAmount();
      
      setTimeUntilNextClaim(timeLeft);
      setFaucetAmount(amount);
    } catch (error) {
      console.warn('Failed to check faucet status:', error);
    }
  };

  const claimFaucet = async (): Promise<{ success: boolean; message: string; txHash?: string }> => {
    if (!isConnected || !address) {
      return { success: false, message: 'Please connect your wallet first' };
    }

    if (timeUntilNextClaim > 0) {
      return { success: false, message: 'Please wait for cooldown period to end' };
    }

    setIsLoading(true);
    
    try {
      await contractService.initialize();
      const tx = await contractService.claimFaucet();
      
      // Update cooldown immediately (24 hours)
      setTimeUntilNextClaim(24 * 60 * 60); // 24 hours in seconds
      
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
    timeUntilNextClaim,
    faucetAmount,
    canClaim: timeUntilNextClaim === 0 && isConnected,
    formatTimeRemaining: () => formatTimeRemaining(timeUntilNextClaim),
    isConnected
  };
};
