import React from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { CONTRACT_CONFIG, STAKING_ABI } from '@/lib/contracts';
import { formatUnits } from 'viem';

export const StakingDiagnostic = () => {
  const { address, isConnected } = useAccount();

  // Test staking contract connection
  const { data: allRegions, error: regionsError, isLoading: regionsLoading } = useReadContract({
    address: CONTRACT_CONFIG.STAKING_CONTRACT_ADDRESS as `0x${string}`,
    abi: STAKING_ABI,
    functionName: 'getAllRegions',
    query: {
      enabled: CONTRACT_CONFIG.STAKING_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000",
    }
  });

  // Test user staking data
  const { data: userStaked, error: stakedError, isLoading: stakedLoading } = useReadContract({
    address: CONTRACT_CONFIG.STAKING_CONTRACT_ADDRESS as `0x${string}`,
    abi: STAKING_ABI,
    functionName: 'getUserTotalStaked',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && CONTRACT_CONFIG.STAKING_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000",
    }
  });

  // Test staking info from staking contract
  const { data: stakingInfo, error: stakingInfoError, isLoading: stakingInfoLoading } = useReadContract({
    address: CONTRACT_CONFIG.STAKING_CONTRACT_ADDRESS as `0x${string}`,
    abi: STAKING_ABI,
    functionName: 'getUserStakingInfo',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && CONTRACT_CONFIG.STAKING_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000",
    }
  });

  if (!isConnected) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mt-4">
        <h3 className="text-yellow-400 font-medium mb-2">🔍 Staking Diagnostic</h3>
        <p className="text-gray-400">Connect wallet to run diagnostics</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mt-4">
      <h3 className="text-yellow-400 font-medium mb-4">🔍 Staking Diagnostic</h3>
      
      <div className="space-y-3 text-sm">
        <div>
          <strong className="text-gray-300">Contract Address:</strong>
          <div className="text-gray-400 font-mono text-xs break-all">
            {CONTRACT_CONFIG.STAKING_CONTRACT_ADDRESS}
          </div>
        </div>

        <div>
          <strong className="text-gray-300">Regions Data:</strong>
          {regionsLoading && <span className="text-blue-400"> Loading...</span>}
          {regionsError && <span className="text-red-400"> Error: {regionsError.message}</span>}
          {allRegions && (
            <div className="text-green-400">
              ✅ Found {(allRegions as any[])[0]?.length || 0} regions
            </div>
          )}
        </div>

        <div>
          <strong className="text-gray-300">User Total Staked:</strong>
          {stakedLoading && <span className="text-blue-400"> Loading...</span>}
          {stakedError && <span className="text-red-400"> Error: {stakedError.message}</span>}
          {userStaked !== undefined && (
            <div className="text-green-400">
              ✅ {formatUnits(userStaked as bigint, 6)} USDC
            </div>
          )}
        </div>

        <div>
          <strong className="text-gray-300">Staking Info from Contract:</strong>
          {stakingInfoLoading && <span className="text-blue-400"> Loading...</span>}
          {stakingInfoError && <span className="text-red-400"> Error: {stakingInfoError.message}</span>}
          {stakingInfo && (
            <div className="text-green-400">
              ✅ Staked: {formatUnits((stakingInfo as any[])[0] as bigint, 6)} USDC
            </div>
          )}
        </div>

        <div className="mt-4 p-2 bg-blue-900/30 border border-blue-700/50 rounded">
          <p className="text-blue-300 text-xs">
            <strong>Note:</strong> If you see errors above, the staking contract may not be properly deployed 
            or the contract address in the frontend config may be incorrect.
          </p>
        </div>
      </div>
    </div>
  );
};
