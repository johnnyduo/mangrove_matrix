import { ethers } from 'ethers';
import { CONTRACT_CONFIG, USDC_ABI, FUNDING_ABI, formatUSDC, parseUSDC } from './contracts';

export interface Campaign {
  id: number;
  name: string;
  location: string;
  targetAmount: bigint;
  raisedAmount: bigint;
  deadline: number;
  beneficiary: string;
  isActive: boolean;
  fundsReleased: boolean;
  carbonCreditsExpected: number;
}

export interface CampaignProgress {
  percentageRaised: number;
  daysLeft: number;
  isSuccessful: boolean;
}

export interface UserStats {
  totalContributed: bigint;
  carbonCredits: bigint;
}

export class ContractService {
  private _provider: ethers.BrowserProvider | null = null;
  private _signer: ethers.Signer | null = null;
  private _usdcContract: ethers.Contract | null = null;
  private _fundingContract: ethers.Contract | null = null;
  
  // Public getters for private properties
  get provider(): ethers.BrowserProvider | null {
    return this._provider;
  }
  
  get signer(): ethers.Signer | null {
    return this._signer;
  }
  
  get usdcContract(): ethers.Contract | null {
    return this._usdcContract;
  }
  
  get fundingContract(): ethers.Contract | null {
    return this._fundingContract;
  }

  async initialize() {
    if (!window.ethereum) {
      throw new Error('MetaMask not found');
    }

    this._provider = new ethers.BrowserProvider(window.ethereum as any);
    this._signer = await this._provider.getSigner();
    
    try {
      // Initialize contracts - disable ENS resolution by using direct addresses only
      const usdcAddress = CONTRACT_CONFIG.USDC_ADDRESS;
      const fundingAddress = CONTRACT_CONFIG.FUNDING_ADDRESS;
      
      // Ensure we're using hexadecimal addresses, not ENS names
      this._usdcContract = new ethers.Contract(
        usdcAddress,
        USDC_ABI,
        this._signer
      );
      
      this._fundingContract = new ethers.Contract(
        fundingAddress,
        FUNDING_ABI,
        this._signer
      );
    } catch (error) {
      console.error('Contract initialization error:', error);
      throw new Error('Failed to initialize contracts. Optimism Sepolia does not support ENS.');
    }
  }

  // USDC Functions
  async getUSDCBalance(address: string): Promise<string> {
    if (!this._usdcContract) throw new Error('Contract not initialized');
    
    try {
      const balance = await this._usdcContract.balanceOf(address);
      return formatUSDC(balance);
    } catch (error) {
      console.warn('Failed to get USDC balance, returning mock data:', error);
      return '10000.00'; // Mock balance for development
    }
  }

  async approveUSDC(amount: string): Promise<ethers.TransactionResponse> {
    if (!this._usdcContract) throw new Error('Contract not initialized');
    const amountBigInt = parseUSDC(amount);
    return await this._usdcContract.approve(CONTRACT_CONFIG.FUNDING_ADDRESS, amountBigInt);
  }

  async getUSDCAllowance(owner: string): Promise<string> {
    if (!this._usdcContract) throw new Error('Contract not initialized');
    const allowance = await this._usdcContract.allowance(owner, CONTRACT_CONFIG.FUNDING_ADDRESS);
    return formatUSDC(allowance);
  }

  async mintTestUSDC(amount: string): Promise<ethers.TransactionResponse> {
    if (!this._usdcContract || !this._signer) throw new Error('Contract not initialized');
    const amountBigInt = parseUSDC(amount);
    const address = await this._signer.getAddress();
    return await this._usdcContract.mint(address, amountBigInt);
  }

  // Campaign Functions
  async createCampaign(
    name: string,
    location: string,
    targetAmount: string,
    durationDays: number,
    carbonCreditsExpected: number
  ): Promise<ethers.TransactionResponse> {
    if (!this._fundingContract) throw new Error('Contract not initialized');
    const targetAmountBigInt = parseUSDC(targetAmount);
    return await this._fundingContract.createCampaign(
      name,
      location,
      targetAmountBigInt,
      durationDays,
      carbonCreditsExpected
    );
  }

  async contribute(campaignId: number, amount: string): Promise<ethers.TransactionResponse> {
    if (!this._fundingContract) throw new Error('Contract not initialized');
    const amountBigInt = parseUSDC(amount);
    return await this._fundingContract.contribute(campaignId, amountBigInt);
  }

  async getCampaign(campaignId: number): Promise<Campaign> {
    if (!this._fundingContract) throw new Error('Contract not initialized');
    const result = await this._fundingContract.getCampaign(campaignId);
    return {
      id: Number(result.id),
      name: result.name,
      location: result.location,
      targetAmount: result.targetAmount,
      raisedAmount: result.raisedAmount,
      deadline: Number(result.deadline),
      beneficiary: result.beneficiary,
      isActive: result.isActive,
      fundsReleased: result.fundsReleased,
      carbonCreditsExpected: Number(result.carbonCreditsExpected)
    };
  }

  async getCampaignProgress(campaignId: number): Promise<CampaignProgress> {
    if (!this._fundingContract) throw new Error('Contract not initialized');
    const result = await this._fundingContract.getCampaignProgress(campaignId);
    return {
      percentageRaised: Number(result.percentageRaised),
      daysLeft: Number(result.daysLeft),
      isSuccessful: result.isSuccessful
    };
  }

  async getAllCampaigns(): Promise<Campaign[]> {
    if (!this._fundingContract) throw new Error('Contract not initialized');
    
    try {
      const count = await this._fundingContract.campaignCounter();
      const campaigns: Campaign[] = [];
      
      for (let i = 1; i <= Number(count); i++) {
        try {
          const campaign = await this.getCampaign(i);
          campaigns.push(campaign);
        } catch (error) {
          console.warn(`Failed to load campaign ${i}:`, error);
        }
      }
      
      return campaigns;
    } catch (error) {
      console.warn('Failed to load campaigns from contract, using mock data:', error);
      
      // Mock data for development and testing
      return [
        {
          id: 1,
          name: "Sundarbans Mangrove Restoration",
          location: "Bangladesh",
          targetAmount: BigInt(300000000000), // 300,000 USDC
          raisedAmount: BigInt(125000000000), // 125,000 USDC
          deadline: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days from now
          beneficiary: "0x0000000000000000000000000000000000000003",
          isActive: true,
          fundsReleased: false,
          carbonCreditsExpected: 5000
        },
        {
          id: 2,
          name: "Coral Triangle Mangrove Conservation",
          location: "Indonesia",
          targetAmount: BigInt(500000000000), // 500,000 USDC
          raisedAmount: BigInt(300000000000), // 300,000 USDC
          deadline: Math.floor(Date.now() / 1000) + 15 * 24 * 60 * 60, // 15 days from now
          beneficiary: "0x0000000000000000000000000000000000000004",
          isActive: true,
          fundsReleased: false,
          carbonCreditsExpected: 8500
        }
      ];
    }
  }

  async getUserStats(address: string): Promise<UserStats> {
    if (!this._fundingContract) throw new Error('Contract not initialized');
    
    try {
      const result = await this._fundingContract.getUserStats(address);
      return {
        totalContributed: result.totalContributed,
        carbonCredits: result.carbonCredits
      };
    } catch (error) {
      console.warn('Failed to get user stats, returning mock data:', error);
      return {
        totalContributed: BigInt(15000000000), // 15,000 USDC contributed
        carbonCredits: BigInt(250) // 250 carbon credits
      };
    }
  }

  async getContribution(campaignId: number, address: string): Promise<string> {
    if (!this._fundingContract) throw new Error('Contract not initialized');
    const contribution = await this._fundingContract.getContribution(campaignId, address);
    return formatUSDC(contribution);
  }

  async releaseFunds(campaignId: number): Promise<ethers.TransactionResponse> {
    if (!this._fundingContract) throw new Error('Contract not initialized');
    return await this._fundingContract.releaseFunds(campaignId);
  }

  async refund(campaignId: number): Promise<ethers.TransactionResponse> {
    if (!this._fundingContract) throw new Error('Contract not initialized');
    return await this._fundingContract.refund(campaignId);
  }
  
  // Add a direct stake/contribute method for MangroveMatrix regions
  async stakeForRegion(region: any, amount: string): Promise<ethers.TransactionResponse> {
    if (!this._fundingContract) throw new Error('Contract not initialized');
    
    // In a real implementation, we would map regions to campaign IDs
    // For now, use a default campaign ID of 1 for all regions
    const campaignId = 1;
    
    // Convert amount to BigInt with proper decimals
    const amountBigInt = parseUSDC(amount);
    
    // Call the contribute function on the contract
    return await this._fundingContract.contribute(campaignId, amountBigInt);
  }

  // Faucet Functions
  async claimFaucet(): Promise<ethers.TransactionResponse> {
    if (!this._usdcContract) throw new Error('Contract not initialized');
    
    try {
      return await this._usdcContract.faucet();
    } catch (error: any) {
      console.error('Faucet claim error:', error);
      if (error.message?.includes('Please wait 24 hours')) {
        throw new Error('Please wait 24 hours between faucet requests');
      }
      throw new Error('Failed to claim faucet tokens');
    }
  }

  async getTimeUntilNextClaim(address: string): Promise<number> {
    if (!this._usdcContract) throw new Error('Contract not initialized');
    
    try {
      const timeLeft = await this._usdcContract.timeUntilNextClaim(address);
      return Number(timeLeft);
    } catch (error) {
      console.warn('Failed to get faucet cooldown, returning 0:', error);
      return 0;
    }
  }

  async getFaucetAmount(): Promise<string> {
    if (!this._usdcContract) throw new Error('Contract not initialized');
    
    try {
      const amount = await this._usdcContract.FAUCET_AMOUNT();
      return formatUSDC(amount);
    } catch (error) {
      console.warn('Failed to get faucet amount, returning default:', error);
      return '1000.00'; // Default faucet amount
    }
  }

  // Utility functions
  formatUSDC = formatUSDC;
  parseUSDC = parseUSDC;

  getBlockExplorerLink(txHash: string): string {
    return `${CONTRACT_CONFIG.BLOCK_EXPLORER}/tx/${txHash}`;
  }
}

// Singleton instance
export const contractService = new ContractService();
