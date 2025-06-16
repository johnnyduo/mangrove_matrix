// Contract addresses and configuration
export const CONTRACT_CONFIG = {
  // OP Sepolia USDC Token - Verified address
  USDC_ADDRESS: "0xf0E7410525D28d642c367530Add29931826071eC", // Correct USDC contract on OP Sepolia
  FUNDING_ADDRESS: "0x344a5E8DC5f256c49a1F6b38EE40cDE2f4C03012", // Mock funding address for demo
  
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
  "function getCampaign(uint256 campaignId) view returns (tuple(uint256 id, string name, string location, uint256 targetAmount, uint256 raisedAmount, uint256 deadline, address beneficiary, bool isActive, bool fundsReleased, uint256 carbonCreditsExpected))",
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

// Helper functions
export const formatUSDC = (amount: bigint): string => {
  return (Number(amount) / Math.pow(10, CONTRACT_CONFIG.USDC_DECIMALS)).toLocaleString();
};

export const parseUSDC = (amount: string): bigint => {
  return BigInt(Math.floor(parseFloat(amount) * Math.pow(10, CONTRACT_CONFIG.USDC_DECIMALS)));
};
