# Simple MangroveMatrix Funding Contract - Hackathon MVP

## 🎯 **Quick Overview**

This is a simplified, hackathon-ready version of the MangroveMatrix funding contract that focuses on core functionality without complex features that cause compilation issues.

## ✅ **Core Features**

### **Essential Functionality**
- ✅ Create funding campaigns for mangrove conservation
- ✅ Accept USDC contributions from users
- ✅ Release funds when target is reached
- ✅ Automatic carbon credit rewards
- ✅ Refund system for failed campaigns
- ✅ Platform fee mechanism

### **Simplified Structure**
- ❌ No complex milestone system (removed to avoid stack depth issues)
- ❌ No verifier system (simplified for MVP)
- ❌ No complex mappings (streamlined data structure)
- ✅ Clean, readable code perfect for hackathon demos

## 🚀 **Files**

### **SimpleMangroveMatrixFunding.sol**
Main funding contract with:
- Campaign creation and management
- Contribution handling with carbon credit rewards
- Fund release mechanism
- Refund system for failed campaigns
- Simple view functions for frontend integration

### **SimpleMangroveMatrixDeployer.sol**
Deployment helper that:
- Deploys USDC token and funding contract
- Creates demo campaigns for presentation
- Mints test USDC for users
- Provides contract addresses for frontend

## 🛠️ **Usage for Hackathon**

### **Deploy Contracts**
```solidity
// Deploy everything at once
SimpleMangroveMatrixDeployer deployer = new SimpleMangroveMatrixDeployer();

// Create demo campaigns
deployer.createDemoCampaigns();

// Mint test USDC for demo users
address[] memory users = [user1, user2, user3];
deployer.mintDemoUSDC(users);
```

### **Frontend Integration**
```typescript
// Get contract addresses
const (usdcAddress, fundingAddress) = await deployer.getAddresses();

// Create a campaign
await fundingContract.createCampaign(
  "Save the Mangroves",
  "Indonesia", 
  ethers.parseUnits("10000", 6), // 10,000 USDC
  30, // 30 days
  100 // 100 carbon credits
);

// Contribute to campaign
await usdcToken.approve(fundingAddress, amount);
await fundingContract.contribute(campaignId, amount);

// Check campaign progress
const progress = await fundingContract.getCampaignProgress(campaignId);
```

## 📊 **Demo Data**

The deployer creates 3 sample campaigns:
1. **Sundarbans Restoration** - 50,000 USDC, 30 days, 500 credits
2. **Florida Protection** - 25,000 USDC, 45 days, 300 credits  
3. **Community Garden** - 10,000 USDC, 60 days, 150 credits

## 🎪 **Perfect for Hackathon Because**

- ✅ **No compilation errors** - Simple structure avoids stack depth issues
- ✅ **Quick to deploy** - Single deployer handles everything
- ✅ **Demo-ready** - Pre-loaded with sample campaigns
- ✅ **Easy to understand** - Clean code for judges to review
- ✅ **Frontend-friendly** - Simple view functions
- ✅ **Real functionality** - Actually works for the core use case

## 🚀 **Deployment Steps**

1. Deploy to Optimism Sepolia testnet
2. Call `createDemoCampaigns()` 
3. Call `mintDemoUSDC()` for test users
4. Connect frontend to contract addresses
5. Demo the full flow: create → contribute → release funds

This MVP contract proves the concept while being simple enough for a hackathon timeline! 🎯
