# CC Token Emission Rate Modification Guide

## Current Emission Rate
- **Current:** 0.025 CC per USDC per year
- **Contract location:** `src/contract/CarbonCreditToken.sol`, line 24
- **Variable:** `CC_RATE_PER_USDC_PER_YEAR = 25` (scaled by 1000)

## Option 1: Modify Contract and Redeploy (Recommended)

### Step 1: Update the Contract
Modify the rate in `CarbonCreditToken.sol`:

```solidity
// Current (slow)
uint256 public constant CC_RATE_PER_USDC_PER_YEAR = 25; // 0.025 CC per USDC per year

// Faster options:
uint256 public constant CC_RATE_PER_USDC_PER_YEAR = 100; // 0.1 CC per USDC per year (4x faster)
uint256 public constant CC_RATE_PER_USDC_PER_YEAR = 250; // 0.25 CC per USDC per year (10x faster)
uint256 public constant CC_RATE_PER_USDC_PER_YEAR = 500; // 0.5 CC per USDC per year (20x faster)
uint256 public constant CC_RATE_PER_USDC_PER_YEAR = 1000; // 1.0 CC per USDC per year (40x faster)
```

### Step 2: Redeploy Contracts
```bash
# In your project directory
npx hardhat compile
npx hardhat run scripts/deploy.js --network [your-network]
```

### Step 3: Update Contract Addresses
Update the new contract addresses in your frontend configuration.

## Option 2: Make Rate Configurable (Advanced)

### Convert constant to variable:
```solidity
// Replace the constant with a variable
uint256 public ccRatePerUsdcPerYear = 25; // Default 0.025

// Add function to update rate
function setCCRate(uint256 newRate) public onlyOwner {
    ccRatePerUsdcPerYear = newRate;
    emit CCRateUpdated(newRate);
}

// Update calculation function
function calculatePendingRewards(address user) public view returns (uint256) {
    if (userStakedAmount[user] == 0 || lastRewardTime[user] == 0) {
        return 0;
    }
    
    uint256 timeElapsed = block.timestamp - lastRewardTime[user];
    uint256 yearlyReward = (userStakedAmount[user] * ccRatePerUsdcPerYear) / 1000;
    uint256 pendingReward = (yearlyReward * timeElapsed) / SECONDS_PER_YEAR;
    
    return pendingReward;
}
```

## Recommended Emission Rates for Testing:

| Rate Value | CC per USDC/year | Speed Increase | Use Case |
|------------|------------------|----------------|----------|
| 25         | 0.025           | 1x (current)   | Production |
| 100        | 0.1             | 4x             | Slow testing |
| 500        | 0.5             | 20x            | Fast testing |
| 1000       | 1.0             | 40x            | Very fast testing |
| 2500       | 2.5             | 100x           | Immediate testing |

## Quick Testing Rate
For immediate testing, I recommend using **2500** (2.5 CC per USDC per year), which gives you 100x faster emission.

## Impact on UI
The UI will automatically reflect the new rate since it reads directly from the contract. The "Earning Rate" display will show the updated values.
