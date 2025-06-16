import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_CONFIG, STAKING_ABI, USDC_ABI } from '@/lib/contracts';
import { formatUnits, parseUnits } from 'viem';
import { optimismSepolia } from 'wagmi/chains';

export interface MangroveRegion {
  id: number;
  name: string;
  userStake: string;
  totalStaking: string;
}

export interface StakingData {
  totalStaked: string;
  availableRegions: MangroveRegion[];
  usdcBalance: string;
  usdcAllowance: string;
  stakingFee: string;
}

export const useMangroveStaking = () => {
  const { address, isConnected } = useAccount();
  const [stakingData, setStakingData] = useState<StakingData>({
    totalStaked: '0.00',
    availableRegions: [],
    usdcBalance: '0.00',
    usdcAllowance: '0.00',
    stakingFee: '2.50'
  });

  // Contract write functions
  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Get USDC balance
  const { data: usdcBalance, refetch: refetchBalance } = useReadContract({
    address: CONTRACT_CONFIG.USDC_ADDRESS as `0x${string}`,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 10000,
    }
  });

  // Get USDC allowance for staking contract
  const { data: usdcAllowance, refetch: refetchAllowance } = useReadContract({
    address: CONTRACT_CONFIG.USDC_ADDRESS as `0x${string}`,
    abi: USDC_ABI,
    functionName: 'allowance',
    args: address && CONTRACT_CONFIG.STAKING_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000" 
      ? [address, CONTRACT_CONFIG.STAKING_CONTRACT_ADDRESS as `0x${string}`] 
      : undefined,
    query: {
      enabled: !!address && CONTRACT_CONFIG.STAKING_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000",
      refetchInterval: 10000,
    }
  });

  // Get all regions
  const { data: regionsData, refetch: refetchRegions } = useReadContract({
    address: CONTRACT_CONFIG.STAKING_CONTRACT_ADDRESS as `0x${string}`,
    abi: STAKING_ABI,
    functionName: 'getAllRegions',
    query: {
      enabled: CONTRACT_CONFIG.STAKING_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000",
      refetchInterval: 15000,
    }
  });

  // Get user total staked
  const { data: totalStaked, refetch: refetchTotalStaked } = useReadContract({
    address: CONTRACT_CONFIG.STAKING_CONTRACT_ADDRESS as `0x${string}`,
    abi: STAKING_ABI,
    functionName: 'getUserTotalStaked',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && CONTRACT_CONFIG.STAKING_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000",
      refetchInterval: 10000,
    }
  });

  // Get staking fee
  const { data: stakingFee } = useReadContract({
    address: CONTRACT_CONFIG.STAKING_CONTRACT_ADDRESS as `0x${string}`,
    abi: STAKING_ABI,
    functionName: 'stakingFeePercent',
    query: {
      enabled: CONTRACT_CONFIG.STAKING_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000",
    }
  });

  // Update staking data when contract data changes
  useEffect(() => {
    const updateStakingData = async () => {
      const newData: StakingData = {
        totalStaked: totalStaked ? formatUnits(totalStaked as bigint, 6) : '0.00',
        availableRegions: [],
        usdcBalance: usdcBalance ? formatUnits(usdcBalance as bigint, 6) : '0.00',
        usdcAllowance: usdcAllowance ? formatUnits(usdcAllowance as bigint, 6) : '0.00',
        stakingFee: stakingFee ? ((Number(stakingFee) / 100).toFixed(2)) : '2.50'
      };

      // Process regions data
      if (regionsData && Array.isArray(regionsData) && regionsData.length === 2) {
        const [regionIds, regionNames] = regionsData;
        const regions: MangroveRegion[] = [];

        for (let i = 0; i < (regionIds as any[]).length; i++) {
          const regionId = Number((regionIds as any[])[i]);
          const regionName = (regionNames as any[])[i];
          
          // Get user stake for this region
          let userStake = '0.00';
          if (address && CONTRACT_CONFIG.STAKING_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000") {
            try {
              // We'll fetch this data separately for each region
              userStake = '0.00'; // Will be updated separately
            } catch (error) {
              console.error(`Error fetching user stake for region ${regionId}:`, error);
            }
          }

          regions.push({
            id: regionId,
            name: regionName,
            userStake,
            totalStaking: '0.00' // Will be updated separately
          });
        }

        newData.availableRegions = regions;
      }

      setStakingData(newData);
    };

    updateStakingData();
  }, [address, totalStaked, regionsData, usdcBalance, usdcAllowance, stakingFee]);

  // Handle successful transactions
  useEffect(() => {
    if (isConfirmed) {
      refetchBalance();
      refetchAllowance();
      refetchTotalStaked();
      refetchRegions();
    }
  }, [isConfirmed, refetchBalance, refetchAllowance, refetchTotalStaked, refetchRegions]);

  const approveUSDC = async (amount: string): Promise<{ success: boolean; message: string; txHash?: string }> => {
    if (!isConnected || !address) {
      return { success: false, message: 'Please connect your wallet first' };
    }

    if (CONTRACT_CONFIG.STAKING_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
      return { success: false, message: 'Staking contract not deployed yet' };
    }

    try {
      const amountWei = parseUnits(amount, 6); // USDC has 6 decimals

      writeContract({
        address: CONTRACT_CONFIG.USDC_ADDRESS as `0x${string}`,
        abi: USDC_ABI,
        functionName: 'approve',
        args: [CONTRACT_CONFIG.STAKING_CONTRACT_ADDRESS as `0x${string}`, amountWei],
        chain: optimismSepolia,
        account: address,
      });

      return { 
        success: true, 
        message: `Approving ${amount} USDC for staking...`,
        txHash: txHash 
      };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.message || 'Failed to approve USDC' 
      };
    }
  };

  const stakeUSDC = async (regionId: number, amount: string): Promise<{ success: boolean; message: string; txHash?: string }> => {
    if (!isConnected || !address) {
      return { success: false, message: 'Please connect your wallet first' };
    }

    if (CONTRACT_CONFIG.STAKING_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
      return { success: false, message: 'Staking contract not deployed yet' };
    }

    try {
      const amountWei = parseUnits(amount, 6); // USDC has 6 decimals

      writeContract({
        address: CONTRACT_CONFIG.STAKING_CONTRACT_ADDRESS as `0x${string}`,
        abi: STAKING_ABI,
        functionName: 'stakeUSDC',
        args: [BigInt(regionId), amountWei],
        chain: optimismSepolia,
        account: address,
      });

      return { 
        success: true, 
        message: `Staking ${amount} USDC in region ${regionId}...`,
        txHash: txHash 
      };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.message || 'Failed to stake USDC' 
      };
    }
  };

  const withdrawStake = async (regionId: number, amount: string): Promise<{ success: boolean; message: string; txHash?: string }> => {
    if (!isConnected || !address) {
      return { success: false, message: 'Please connect your wallet first' };
    }

    if (CONTRACT_CONFIG.STAKING_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
      return { success: false, message: 'Staking contract not deployed yet' };
    }

    try {
      const amountWei = parseUnits(amount, 6); // USDC has 6 decimals

      writeContract({
        address: CONTRACT_CONFIG.STAKING_CONTRACT_ADDRESS as `0x${string}`,
        abi: STAKING_ABI,
        functionName: 'withdrawStake',
        args: [BigInt(regionId), amountWei],
        chain: optimismSepolia,
        account: address,
      });

      return { 
        success: true, 
        message: `Withdrawing ${amount} USDC from region ${regionId}...`,
        txHash: txHash 
      };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.message || 'Failed to withdraw stake' 
      };
    }
  };

  const needsApproval = (amount: string): boolean => {
    if (!usdcAllowance) return true;
    const allowanceAmount = parseFloat(formatUnits(usdcAllowance as bigint, 6));
    const requiredAmount = parseFloat(amount);
    return allowanceAmount < requiredAmount;
  };

  const refreshData = () => {
    refetchBalance();
    refetchAllowance();
    refetchTotalStaked();
    refetchRegions();
  };

  return {
    stakingData,
    approveUSDC,
    stakeUSDC,
    withdrawStake,
    needsApproval,
    isPending,
    isConfirming,
    isConnected,
    refreshData
  };
};
