// Contract addresses and configuration
export const CONTRACT_CONFIG = {
  // OP Sepolia USDC Token - Updated address with no faucet cooldown
  USDC_ADDRESS: "0xFa081F90a1dbB9ceEeB910fa7966D2BA0e5EE0A2", // New USDC contract on OP Sepolia
  FUNDING_ADDRESS: "0x344a5E8DC5f256c49a1F6b38EE40cDE2f4C03012", // Mock funding address for demo
  CC_TOKEN_ADDRESS: "0x3D66a37681Aff88F4Eb10De239C0F9Cc3E529844", // CC Token contract deployed on OP Sepolia
  STAKING_CONTRACT_ADDRESS: "0xCe969D64aABA688415a65A9a032198726eDf270A", // MangroveStaking contract deployed
  
  // For basic staking, we'll use the contract owner address
  OWNER_ADDRESS: "0x5ebaddf71482d40044391923BE1fC42938129988", // Replace with actual owner address
  
  // Network configuration
  CHAIN_ID: 11155420, // Optimism Sepolia
  CHAIN_NAME: "Optimism Sepolia",
  RPC_URL: "https://sepolia.optimism.io",
  BLOCK_EXPLORER: "https://sepolia-optimism.etherscan.io",
  
  // USDC configuration
  USDC_DECIMALS: 6,
  USDC_SYMBOL: "USDC"
};

// Contract ABIs - Standard ERC-20 ABI in JSON format
export const USDC_ABI = [
  {
    "type": "function",
    "name": "transfer",
    "inputs": [
      { "name": "to", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "balanceOf",
    "inputs": [{ "name": "owner", "type": "address" }],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "decimals",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint8" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "faucet",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "timeUntilNextClaim",
    "inputs": [{ "name": "user", "type": "address" }],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "lastMintTime",
    "inputs": [{ "name": "user", "type": "address" }],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "FAUCET_AMOUNT",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "FAUCET_COOLDOWN",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "approve",
    "inputs": [
      { "name": "spender", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "allowance",
    "inputs": [
      { "name": "owner", "type": "address" },
      { "name": "spender", "type": "address" }
    ],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  }
] as const;

// Carbon Credit Token ABI
export const CC_TOKEN_ABI = [
  {
    "type": "function",
    "name": "balanceOf",
    "inputs": [{ "name": "account", "type": "address" }],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "stake",
    "inputs": [
      { "name": "user", "type": "address" },
      { "name": "usdcAmount", "type": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "claimRewards",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "mint",
    "inputs": [
      { "name": "to", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getUserStakingInfo",
    "inputs": [{ "name": "user", "type": "address" }],
    "outputs": [
      { "name": "stakedAmount", "type": "uint256" },
      { "name": "ccEarned", "type": "uint256" },
      { "name": "hectaresSupported", "type": "uint256" },
      { "name": "verificationPhase", "type": "uint256" },
      { "name": "pendingRewards", "type": "uint256" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "calculatePendingRewards",
    "inputs": [{ "name": "user", "type": "address" }],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "name",
    "inputs": [],
    "outputs": [{ "name": "", "type": "string" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "symbol",
    "inputs": [],
    "outputs": [{ "name": "", "type": "string" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "decimals",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint8" }],
    "stateMutability": "view"
  }
] as const;

export const FUNDING_ABI = [
  // Campaign management
  "function createCampaign(string name, string location, uint256 targetAmount, uint256 durationDays, uint256 carbonCreditsExpected) returns (uint256)",
  "function contribute(uint256 campaignId, uint256 amount)",
  "function releaseFunds(uint256 campaignId)",
  "function refund(uint256 campaignId)",
  "function stopCampaign(uint256 campaignId)",
  
  // View functions
  "function getCampaign(uint256 campaignId) view returns (tuple(uint256 id, string name, uint256 targetAmount, uint256 raisedAmount, uint256 deadline, address beneficiary, bool isActive, bool fundsReleased, uint256 carbonCreditsExpected))",
  "function getContribution(uint256 campaignId, address contributor) view returns (uint256)",
  "function getCampaignProgress(uint256 campaignId) view returns (uint256 percentageRaised, uint256 daysLeft, bool isSuccessful)",
  "function getUserStats(address user) view returns (uint256 totalContributed, uint256 carbonCredits)",
  
  // State variables
  "function campaignCounter() view returns (uint256)",
  "function totalFundsRaised() view returns (uint256)",
  "function owner() view returns (address)",
  "function platformFeePercent() view returns (uint256)",
  
  // Events
  "event CampaignCreated(uint256 indexed campaignId, string name, uint256 targetAmount, address beneficiary)",
  "event ContributionMade(uint256 indexed campaignId, address indexed contributor, uint256 amount)",
  "event FundsReleased(uint256 indexed campaignId, uint256 amount, address beneficiary)",
  "event CarbonCreditsIssued(address indexed contributor, uint256 amount, uint256 campaignId)",
  "event RefundIssued(uint256 indexed campaignId, address indexed contributor, uint256 amount)"
];

// MangroveStaking Contract ABI
export const STAKING_ABI = [
  {
    "type": "function",
    "name": "stakeUSDC",
    "inputs": [
      { "name": "regionId", "type": "uint256" },
      { "name": "amount", "type": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "withdrawStake",
    "inputs": [
      { "name": "regionId", "type": "uint256" },
      { "name": "amount", "type": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getUserTotalStaked",
    "inputs": [{ "name": "user", "type": "address" }],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getUserRegionStake",
    "inputs": [
      { "name": "user", "type": "address" },
      { "name": "regionId", "type": "uint256" }
    ],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getRegionTotalStaking",
    "inputs": [{ "name": "regionId", "type": "uint256" }],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getUserStakingInfo",
    "inputs": [{ "name": "user", "type": "address" }],
    "outputs": [
      { "name": "stakedAmount", "type": "uint256" },
      { "name": "ccEarned", "type": "uint256" },
      { "name": "hectaresSupported", "type": "uint256" },
      { "name": "verificationPhase", "type": "uint256" },
      { "name": "pendingRewards", "type": "uint256" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getAllRegions",
    "inputs": [],
    "outputs": [
      { "name": "regionIds", "type": "uint256[]" },
      { "name": "regionNames", "type": "string[]" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getContractBalance",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "stakingFeePercent",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "mangroveRegions",
    "inputs": [{ "name": "", "type": "uint256" }],
    "outputs": [{ "name": "", "type": "string" }],
    "stateMutability": "view"
  },
  {
    "type": "event",
    "name": "StakeDeposited",
    "inputs": [
      { "name": "user", "type": "address", "indexed": true },
      { "name": "regionId", "type": "uint256", "indexed": true },
      { "name": "amount", "type": "uint256", "indexed": false },
      { "name": "fee", "type": "uint256", "indexed": false }
    ]
  },
  {
    "type": "event",
    "name": "StakeWithdrawn",
    "inputs": [
      { "name": "user", "type": "address", "indexed": true },
      { "name": "regionId", "type": "uint256", "indexed": true },
      { "name": "amount", "type": "uint256", "indexed": false }
    ]
  }
];

// Helper functions
export const formatUSDC = (amount: bigint): string => {
  return (Number(amount) / Math.pow(10, CONTRACT_CONFIG.USDC_DECIMALS)).toLocaleString();
};

export const parseUSDC = (amount: string): bigint => {
  return BigInt(Math.floor(parseFloat(amount) * Math.pow(10, CONTRACT_CONFIG.USDC_DECIMALS)));
};
