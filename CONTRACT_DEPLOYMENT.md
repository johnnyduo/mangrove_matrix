# Smart Contract Deployment & Integration Guide

This guide will help you deploy the complete MangroveMatrix staking system and integrate it with the frontend.

## Contracts Overview

The system consists of two main smart contracts:

1. **CarbonCreditToken.sol** - ERC-20 token that handles staking tracking and CC token rewards
2. **MangroveStaking.sol** - Main staking contract that handles USDC deposits and region management

## Prerequisites

- Optimism Sepolia testnet setup
- Contract deployer wallet with ETH for gas
- USDC contract address on Optimism Sepolia

## Deployment Steps

### Step 1: Deploy CarbonCreditToken Contract

```solidity
// File: src/contract/CarbonCreditToken.sol
// Deploy this contract first
```

**Constructor parameters:** None (uses msg.sender as owner)

**After deployment:**
- Note the contract address
- Update `CC_TOKEN_ADDRESS` in `src/lib/contracts.ts`

### Step 2: Deploy MangroveStaking Contract

```solidity
// File: src/contract/MangroveStaking.sol
// Deploy this contract second
```

**Constructor parameters:**
- `_usdcToken`: USDC contract address on Optimism Sepolia
- `_ccToken`: CarbonCreditToken address from Step 1
- `_feeRecipient`: Address to receive platform fees

**After deployment:**
- Note the contract address
- Update `STAKING_CONTRACT_ADDRESS` in `src/lib/contracts.ts`

### Step 3: Configure CarbonCreditToken

Call the following function on CarbonCreditToken:

```solidity
setStakingContract(address _stakingContract)
```

This allows the MangroveStaking contract to call staking functions on the CC token.

### Step 4: Update Frontend Configuration

Update `src/lib/contracts.ts`:

```typescript
export const CONTRACT_CONFIG = {
  CC_TOKEN_ADDRESS: "0x...", // Your deployed CC token address
  STAKING_CONTRACT_ADDRESS: "0x...", // Your deployed staking contract address
  // ... other config
};
```

## Testing the System

### 1. Get Test USDC

Use the USDC faucet to get test tokens:
- Call `faucet()` function on the USDC contract
- This gives you 1000 USDC for testing

### 2. Test Staking Flow

1. **Approve USDC**: Allow staking contract to spend your USDC
2. **Stake USDC**: Call `stakeUSDC(regionId, amount)` on staking contract
3. **Verify Stake**: Check your staking info through the CC token contract
4. **Wait for Rewards**: CC tokens accumulate over time
5. **Claim Rewards**: Call `claimRewards()` on CC token contract

### 3. Frontend Testing

1. Start the development server: `yarn dev`
2. Connect your wallet
3. Navigate to a mangrove region
4. Click "Fund" → "Stake USDC"
5. Follow the staking flow
6. Check "Your Stakes" section for updates

## Contract Functions Reference

### MangroveStaking Contract

```solidity
// Main staking function
function stakeUSDC(uint256 regionId, uint256 amount) external

// Withdraw staked USDC
function withdrawStake(uint256 regionId, uint256 amount) external

// View functions
function getUserTotalStaked(address user) external view returns (uint256)
function getUserRegionStake(address user, uint256 regionId) external view returns (uint256)
function getAllRegions() external view returns (uint256[] memory, string[] memory)
```

### CarbonCreditToken Contract

```solidity
// Claim accumulated rewards
function claimRewards() external

// View staking info
function getUserStakingInfo(address user) external view returns (
    uint256 stakedAmount,
    uint256 ccEarned,
    uint256 hectaresSupported,
    uint256 verificationPhase,
    uint256 pendingRewards
)

// Check pending rewards
function calculatePendingRewards(address user) external view returns (uint256)
```

## Economics

- **Earning Rate**: 0.025 CC tokens per USDC per year (2.5% APY)
- **Platform Fee**: 2.5% of staked amount (configurable)
- **Verification Phases**:
  - Phase 1: 1-499 USDC staked
  - Phase 2: 500-999 USDC staked  
  - Phase 3: 1000+ USDC staked

## Security Features

- **Owner-only functions**: Contract management restricted to deployer
- **Reentrancy protection**: Safe transfer patterns used
- **Validation**: Amount and address validation on all functions
- **Emergency functions**: Owner can pause/unpause if needed

## Common Issues & Solutions

### 1. "Insufficient allowance" error
**Solution**: Call `approve()` on USDC contract for staking contract address

### 2. "Only staking contract can call this function"
**Solution**: Ensure `setStakingContract()` was called on CC token

### 3. Frontend shows "Contract not deployed"
**Solution**: Update contract addresses in `src/lib/contracts.ts`

### 4. Rewards not accumulating
**Solution**: Ensure time has passed since staking (rewards calculated per second)

### 5. Can't claim rewards
**Solution**: Check that you have pending rewards > 0

## Development Tools

### Owner Testing Functions

For contract owners, additional testing functions are available:

```solidity
// CC Token contract
function mint(address to, uint256 amount) public onlyOwner

// Test staking (bypasses USDC transfer)
function stake(address user, uint256 usdcAmount) public onlyStakingContract
```

### Frontend Dev Tools

The frontend includes development-only buttons in the StakingInfoCard component:
- "Stake 500 USDC" - Simulates staking for testing
- "Mint 10 CC" - Mints CC tokens directly for testing

These only work for contract owners and are visible in development mode.

## Next Steps

1. Deploy both contracts to Optimism Sepolia
2. Update frontend configuration with deployed addresses
3. Test the complete flow end-to-end
4. Verify all UI components show correct data
5. Test with multiple users/wallets
6. Monitor gas costs and optimize if needed

## Support

If you encounter issues:
1. Check contract addresses are correct
2. Verify wallet has sufficient ETH for gas
3. Ensure USDC approval is sufficient
4. Check transaction logs for revert reasons
5. Use block explorer to verify contract state
