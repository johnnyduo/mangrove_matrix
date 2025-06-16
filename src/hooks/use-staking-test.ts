import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_CONFIG, CC_TOKEN_ABI, STAKING_ABI, USDC_ABI } from '@/lib/contracts';
import { parseUnits } from 'viem';
import { optimismSepolia } from 'wagmi/chains';

export const useStakingTest = () => {
  const { address, isConnected } = useAccount();
  const [isTestStaking, setIsTestStaking] = useState(false);

  // Contract interaction hooks
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const simulateStaking = async (usdcAmount: string): Promise<{ success: boolean; message: string; txHash?: string }> => {
    if (!isConnected || !address) {
      return { success: false, message: 'Please connect your wallet first' };
    }

    if (!usdcAmount || parseFloat(usdcAmount) <= 0) {
      return { success: false, message: 'Please enter a valid amount' };
    }

    if (CONTRACT_CONFIG.CC_TOKEN_ADDRESS === "0x0000000000000000000000000000000000000000") {
      return { success: false, message: 'CC Token contract not deployed yet' };
    }

    try {
      setIsTestStaking(true);
      
      // Convert amount to wei (USDC has 6 decimals)
      const amountInWei = parseUnits(usdcAmount, 6);
      
      // Try to call the stake function (this will only work if user is owner or staking contract)
      writeContract({
        address: CONTRACT_CONFIG.CC_TOKEN_ADDRESS as `0x${string}`,
        abi: CC_TOKEN_ABI,
        functionName: 'stake',
        args: [address, amountInWei],
        chain: optimismSepolia,
        account: address,
      });

      return { 
        success: true, 
        message: `Simulating stake of ${usdcAmount} USDC!`,
        txHash: hash 
      };
    } catch (error: any) {
      setIsTestStaking(false);
      return { 
        success: false, 
        message: error.message || 'Failed to simulate staking. You might not have owner permissions.' 
      };
    }
  };

  const mintTestTokens = async (ccAmount: string): Promise<{ success: boolean; message: string; txHash?: string }> => {
    if (!isConnected || !address) {
      return { success: false, message: 'Please connect your wallet first' };
    }

    if (!ccAmount || parseFloat(ccAmount) <= 0) {
      return { success: false, message: 'Please enter a valid amount' };
    }

    try {
      // Convert amount to wei (CC tokens have 18 decimals)
      const amountInWei = parseUnits(ccAmount, 18);
      
      // Try to mint CC tokens (only works if user is owner)
      writeContract({
        address: CONTRACT_CONFIG.CC_TOKEN_ADDRESS as `0x${string}`,
        abi: CC_TOKEN_ABI,
        functionName: 'mint',
        args: [address, amountInWei],
        chain: optimismSepolia,
        account: address,
      });

      return { 
        success: true, 
        message: `Minting ${ccAmount} CC tokens for testing!`,
        txHash: hash 
      };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.message || 'Failed to mint tokens. You might not have owner permissions.' 
      };
    }
  };

  // Reset test state when transaction completes
  if (isConfirmed && isTestStaking) {
    setIsTestStaking(false);
  }

  return {
    simulateStaking,
    mintTestTokens,
    isPending,
    isConfirming,
    isConfirmed,
    writeError,
    isConnected,
    isTestStaking
  };
};
