import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_CONFIG, CC_TOKEN_ABI } from '@/lib/contracts';
import { parseUnits } from 'viem';
import { optimismSepolia } from 'wagmi/chains';

export const useCCMint = () => {
  const { address, isConnected } = useAccount();
  const [mintAmount, setMintAmount] = useState('');

  // Contract interaction hooks
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const mintCCTokens = async (): Promise<{ success: boolean; message: string; txHash?: string }> => {
    if (!isConnected || !address) {
      return { success: false, message: 'Please connect your wallet first' };
    }

    if (!mintAmount || parseFloat(mintAmount) <= 0) {
      return { success: false, message: 'Please enter a valid amount' };
    }

    if (CONTRACT_CONFIG.CC_TOKEN_ADDRESS === "0x0000000000000000000000000000000000000000") {
      return { success: false, message: 'CC Token contract not deployed yet' };
    }

    try {
      // Convert amount to wei (CC tokens have 18 decimals)
      const amountInWei = parseUnits(mintAmount, 18);
      
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
        message: `Minting ${mintAmount} CC tokens!`,
        txHash: hash 
      };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.message || 'Failed to mint CC tokens' 
      };
    }
  };

  return {
    mintAmount,
    setMintAmount,
    mintCCTokens,
    isPending,
    isConfirming,
    isConfirmed,
    writeError,
    isConnected
  };
};
