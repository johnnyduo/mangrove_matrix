import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_CONFIG, CC_TOKEN_ABI } from '@/lib/contracts';
import { formatUnits } from 'viem';
import { optimismSepolia } from 'wagmi/chains';

export interface StakingInfo {
  stakedAmount: string;
  ccEarned: string;
  hectaresSupported: string;
  verificationPhase: number;
  pendingRewards: string;
}

export const useCarbonCredit = () => {
  const { address, isConnected } = useAccount();
  const [stakingInfo, setStakingInfo] = useState<StakingInfo>({
    stakedAmount: '0.00',
    ccEarned: '0.00',
    hectaresSupported: '0.0',
    verificationPhase: 1,
    pendingRewards: '0.00'
  });

  // Get CC Token balance
  const { data: ccBalance, refetch: refetchBalance } = useReadContract({
    address: CONTRACT_CONFIG.CC_TOKEN_ADDRESS as `0x${string}`,
    abi: CC_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && CONTRACT_CONFIG.CC_TOKEN_ADDRESS !== "0x0000000000000000000000000000000000000000",
      refetchInterval: 10000, // Refresh every 10 seconds
    }
  });

  // Get user staking info
  const { data: userStakingData, refetch: refetchStakingInfo } = useReadContract({
    address: CONTRACT_CONFIG.CC_TOKEN_ADDRESS as `0x${string}`,
    abi: CC_TOKEN_ABI,
    functionName: 'getUserStakingInfo',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && CONTRACT_CONFIG.CC_TOKEN_ADDRESS !== "0x0000000000000000000000000000000000000000",
      refetchInterval: 10000, // Refresh every 10 seconds
    }
  });

  // Claim rewards contract call
  const { writeContract, data: claimHash, isPending: isClaimPending } = useWriteContract();
  const { isLoading: isClaimConfirming, isSuccess: isClaimConfirmed } = useWaitForTransactionReceipt({
    hash: claimHash,
  });

  // Update staking info when data changes
  useEffect(() => {
    if (userStakingData && Array.isArray(userStakingData) && userStakingData.length >= 5) {
      const [staked, earned, hectares, phase, pending] = userStakingData;
      
      setStakingInfo({
        stakedAmount: formatUnits(staked as bigint, 6), // USDC has 6 decimals
        ccEarned: formatUnits(earned as bigint, 18), // CC tokens have 18 decimals
        hectaresSupported: (Number(formatUnits(hectares as bigint, 18)) / 1000).toFixed(1), // Scale down
        verificationPhase: Number(phase),
        pendingRewards: formatUnits(pending as bigint, 18)
      });
    }
  }, [userStakingData]);

  // Handle successful claim
  useEffect(() => {
    if (isClaimConfirmed) {
      refetchBalance();
      refetchStakingInfo();
    }
  }, [isClaimConfirmed, refetchBalance, refetchStakingInfo]);

  const claimRewards = async (): Promise<{ success: boolean; message: string; txHash?: string }> => {
    if (!isConnected || !address) {
      return { success: false, message: 'Please connect your wallet first' };
    }

    if (CONTRACT_CONFIG.CC_TOKEN_ADDRESS === "0x0000000000000000000000000000000000000000") {
      return { success: false, message: 'CC Token contract not deployed yet' };
    }

    if (parseFloat(stakingInfo.pendingRewards) <= 0) {
      return { success: false, message: 'No rewards to claim' };
    }

    try {
      writeContract({
        address: CONTRACT_CONFIG.CC_TOKEN_ADDRESS as `0x${string}`,
        abi: CC_TOKEN_ABI,
        functionName: 'claimRewards',
        args: [],
        chain: optimismSepolia,
        account: address,
      });

      return { 
        success: true, 
        message: `Claiming ${parseFloat(stakingInfo.pendingRewards).toFixed(2)} CC tokens!`,
        txHash: claimHash 
      };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.message || 'Failed to claim rewards' 
      };
    }
  };

  const formatCCBalance = (): string => {
    if (!ccBalance) return '0.00';
    return parseFloat(formatUnits(ccBalance as bigint, 18)).toFixed(2);
  };

  const getTotalCCEarned = (): string => {
    const earned = parseFloat(stakingInfo.ccEarned);
    const pending = parseFloat(stakingInfo.pendingRewards);
    return (earned + pending).toFixed(2);
  };

  const getVerificationPhaseText = (): string => {
    const phase = stakingInfo.verificationPhase;
    switch(phase) {
      case 1: return '1/3 - Initial';
      case 2: return '2/3 - Intermediate'; 
      case 3: return '3/3 - Advanced';
      default: return '1/3 - Initial';
    }
  };

  const canClaimRewards = (): boolean => {
    return parseFloat(stakingInfo.pendingRewards) > 0 && isConnected;
  };

  return {
    stakingInfo,
    ccBalance: formatCCBalance(),
    totalCCEarned: getTotalCCEarned(),
    verificationPhaseText: getVerificationPhaseText(),
    claimRewards,
    canClaimRewards: canClaimRewards(),
    isClaimPending,
    isClaimConfirming,
    isConnected,
    refetchData: () => {
      refetchBalance();
      refetchStakingInfo();
    }
  };
};
