import { useState, useEffect, useCallback } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { ContractService, Campaign, UserStats } from '@/lib/contractService';
import { CONTRACT_CONFIG } from '@/lib/contracts';
import { toast } from '@/hooks/use-toast';

export interface UseContractsReturn {
  // State
  contractService: ContractService | null;
  isInitialized: boolean;
  isLoading: boolean;
  usdcBalance: string;
  userStats: UserStats | null;
  campaigns: Campaign[];
  
  // Actions
  initializeContracts: () => Promise<void>;
  createCampaign: (name: string, location: string, targetAmount: string, durationDays: number, carbonCredits: number) => Promise<void>;
  contributeToCampaign: (campaignId: number, amount: string) => Promise<void>;
  releaseFunds: (campaignId: number) => Promise<void>;
  refundContribution: (campaignId: number) => Promise<void>;
  refreshData: () => Promise<void>;
  mintTestUSDC: (amount: string) => Promise<void>;
}

export const useContracts = (): UseContractsReturn => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  
  const [contractService, setContractService] = useState<ContractService | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [usdcBalance, setUsdcBalance] = useState('0.00');
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  // Initialize contracts when wallet is connected
  const initializeContracts = useCallback(async () => {
    if (!isConnected || !walletClient || isInitialized) return;
    
    try {
      setIsLoading(true);
      const service = new ContractService();
      await service.initialize();
      setContractService(service);
      setIsInitialized(true);
      
      toast({
        title: "Contracts Initialized",
        description: "Ready to interact with MangroveMatrix contracts",
      });
    } catch (error) {
      console.error('Failed to initialize contracts:', error);
      toast({
        title: "Contract Initialization Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, walletClient, isInitialized]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    if (!contractService || !address) return;
    
    try {
      setIsLoading(true);
      
      // Get USDC balance
      const balance = await contractService.getUSDCBalance(address);
      setUsdcBalance(balance);
      
      // Get user stats
      const stats = await contractService.getUserStats(address);
      setUserStats(stats);
      
      // Get all campaigns
      const allCampaigns = await contractService.getAllCampaigns();
      setCampaigns(allCampaigns);
      
    } catch (error) {
      console.error('Failed to refresh data:', error);
      
      // Show error toast with proper error handling for ENS issues
      if (error.toString().includes('ENS') || error.toString().includes('getEnsAddress')) {
        toast({
          title: "Network Compatibility Issue",
          description: "The current network doesn't support ENS name resolution. Using direct contract addresses instead.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Data Refresh Failed",
          description: error instanceof Error ? error.message : "Unknown error occurred",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [contractService, address]);

  // Create a new campaign
  const createCampaign = useCallback(async (
    name: string, 
    location: string, 
    targetAmount: string, 
    durationDays: number, 
    carbonCredits: number
  ) => {
    if (!contractService) throw new Error('Contracts not initialized');
    
    setIsLoading(true);
    try {
      await contractService.createCampaign(name, location, targetAmount, durationDays, carbonCredits);
      toast({
        title: "Campaign Created",
        description: `Successfully created campaign: ${name}`,
      });
      await refreshData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create campaign";
      toast({
        title: "Campaign Creation Failed",
        description: message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [contractService, refreshData]);

  // Contribute to a campaign
  const contributeToCampaign = useCallback(async (campaignId: number, amount: string) => {
    if (!contractService) throw new Error('Contracts not initialized');
    
    setIsLoading(true);
    try {
      // First approve USDC spending
      await contractService.approveUSDC(amount);
      // Then contribute to campaign
      await contractService.contribute(campaignId, amount);
      toast({
        title: "Contribution Successful",
        description: `Contributed $${amount} USDC to campaign`,
      });
      await refreshData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to contribute";
      toast({
        title: "Contribution Failed",
        description: message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [contractService, refreshData]);

  // Release funds for a campaign
  const releaseFunds = useCallback(async (campaignId: number) => {
    if (!contractService) throw new Error('Contracts not initialized');
    
    setIsLoading(true);
    try {
      await contractService.releaseFunds(campaignId);
      toast({
        title: "Funds Released",
        description: "Campaign funds have been released to beneficiary",
      });
      await refreshData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to release funds";
      toast({
        title: "Release Failed",
        description: message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [contractService, refreshData]);

  // Refund contribution
  const refundContribution = useCallback(async (campaignId: number) => {
    if (!contractService) throw new Error('Contracts not initialized');
    
    setIsLoading(true);
    try {
      await contractService.refund(campaignId);
      toast({
        title: "Refund Successful",
        description: "Your contribution has been refunded",
      });
      await refreshData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to process refund";
      toast({
        title: "Refund Failed",
        description: message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [contractService, refreshData]);

  // Mint test USDC (for demo purposes)
  const mintTestUSDC = useCallback(async (amount: string) => {
    if (!contractService) throw new Error('Contracts not initialized');
    
    setIsLoading(true);
    try {
      await contractService.mintTestUSDC(amount);
      toast({
        title: "Test USDC Minted",
        description: `Minted ${amount} test USDC for demo purposes`,
      });
      await refreshData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to mint USDC";
      toast({
        title: "Mint Failed",
        description: message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [contractService, refreshData]);

  // Auto-initialize when wallet connects
  useEffect(() => {
    if (isConnected && !isInitialized) {
      initializeContracts();
    }
  }, [isConnected, initializeContracts, isInitialized]);

  // Auto-refresh data when initialized
  useEffect(() => {
    if (isInitialized && address) {
      refreshData();
    }
  }, [isInitialized, address, refreshData]);

  return {
    contractService,
    isInitialized,
    isLoading,
    usdcBalance,
    userStats,
    campaigns,
    initializeContracts,
    createCampaign,
    contributeToCampaign,
    releaseFunds,
    refundContribution,
    refreshData,
    mintTestUSDC,
  };
};
