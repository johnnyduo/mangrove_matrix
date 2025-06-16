# 🔗 MangroveMatrix Smart Contracts

## 📄 Contract Overview

This directory contains the smart contracts powering the MangroveMatrix AI-enhanced blockchain platform for mangrove restoration funding.

## 🏗️ Contract Architecture

### 📋 **Deployed Contracts (Optimism Sepolia)**

| Contract | Address | Purpose |
|----------|---------|---------|
| **USDC Token** | `0xFa081F90a1dbB9ceEeB910fa7966D2BA0e5EE0A2` | Faucet-enabled USDC for testing and staking |
| **Carbon Credit Token** | `0x3D66a37681Aff88F4Eb10De239C0F9Cc3E529844` | Reward token with staking mechanism |
| **Funding Contract** | `0x344a5E8DC5f256c49a1F6b38EE40cDE2f4C03012` | Campaign management and funding |
| **Platform Treasury** | `0x5ebaddf71482d40044391923BE1fC42938129988` | Contract owner and treasury |

### 🌐 **Network Information**
- **Network**: Optimism Sepolia Testnet
- **Chain ID**: 11155420
- **Block Explorer**: https://sepolia-optimism.etherscan.io
- **RPC URL**: https://sepolia.optimism.io

## 💰 USDC Token Contract

### 🔧 **Features**
- **Faucet Function**: Users can claim 1000 USDC for testing
- **No Cooldown**: Unlimited claims for development purposes
- **Standard ERC-20**: Full compatibility with DeFi protocols
- **Gas Optimized**: Minimal costs on Optimism L2

### 📝 **Key Functions**
```solidity
function faucet() public
function transfer(address to, uint256 amount) public returns (bool)
function balanceOf(address account) public view returns (uint256)
```

### 💡 **Usage**
```javascript
// Claim USDC from faucet
await usdcContract.faucet();

// Transfer USDC
await usdcContract.transfer(recipientAddress, amount);
```

## 🌱 Carbon Credit (CC) Token Contract

### 🔧 **Advanced Features**
- **Automated Staking**: Real-time reward calculation
- **Dynamic Rewards**: 0.025 CC per USDC per year
- **Verification System**: Tiered phases based on stake amount
- **Hectare Tracking**: Environmental impact metrics
- **Batch Claiming**: Gas-efficient reward distribution

### 📊 **Tokenomics**
```solidity
// Reward Configuration
CC_RATE_PER_USDC_PER_YEAR = 25     // 0.025 scaled by 1000
HECTARES_PER_USDC = 5              // 0.005 scaled by 1000
SECONDS_PER_YEAR = 31,536,000      // 365 * 24 * 60 * 60

// Verification Thresholds
Phase 1: 0-499 USDC    → Basic verification (1/3)
Phase 2: 500-999 USDC  → Intermediate verification (2/3)
Phase 3: 1000+ USDC    → Advanced verification (3/3)
```

### 📝 **Key Functions**
```solidity
// Staking
function stake(address user, uint256 usdcAmount) public

// Rewards
function claimRewards() public
function calculatePendingRewards(address user) public view returns (uint256)

// Information
function getUserStakingInfo(address user) public view returns (
    uint256 stakedAmount,
    uint256 ccEarned,
    uint256 hectaresSupported,
    uint256 verificationPhase,
    uint256 pendingRewards
)

// Admin
function mint(address to, uint256 amount) public onlyOwner
```

### 💡 **Usage Examples**

#### **Frontend Integration**
```typescript
// Get user staking information
const stakingInfo = await ccContract.getUserStakingInfo(userAddress);

// Calculate pending rewards
const pendingRewards = await ccContract.calculatePendingRewards(userAddress);

// Claim rewards
await ccContract.claimRewards();
```

#### **Staking Flow**
```typescript
// 1. Approve USDC spending
await usdcContract.approve(ccTokenAddress, stakeAmount);

// 2. Stake USDC (triggers CC token staking)
await ccContract.stake(userAddress, stakeAmount);

// 3. Monitor rewards accumulation
const rewards = await ccContract.calculatePendingRewards(userAddress);

// 4. Claim CC tokens
if (rewards > 0) {
    await ccContract.claimRewards();
}
```

## 🎯 Reward Calculation Logic

### 📈 **Mathematical Model**
```solidity
// Annual reward calculation
yearlyReward = (stakedAmount * CC_RATE_PER_USDC_PER_YEAR) / 1000

// Time-based reward accrual
timeElapsed = block.timestamp - lastRewardTime
pendingReward = (yearlyReward * timeElapsed) / SECONDS_PER_YEAR

// Hectares calculation
hectaresSupported = (stakedAmount * HECTARES_PER_USDC) / 1000
```

### 🔄 **Real-time Updates**
- Rewards calculated on every interaction
- Automatic compound interest on re-staking
- Gas-optimized batch operations
- Emergency pause functionality

## 🛡️ Security Features

### 🔐 **Access Control**
- **Owner-only functions**: Contract administration
- **Staking contract permissions**: Controlled minting
- **Emergency controls**: Pause/unpause functionality
- **Reentrancy protection**: SafeMath and checks-effects-interactions

### 🧪 **Testing Coverage**
- Unit tests for all functions
- Integration tests with frontend
- Gas optimization analysis
- Security audit recommendations

### ⚠️ **Risk Mitigation**
- Time-locked administrative functions
- Maximum supply caps
- Withdrawal limits
- Multi-signature requirements for critical operations

## 🚀 Development & Testing

### 📋 **Prerequisites**
```bash
Node.js 18+
Hardhat or Foundry
Optimism Sepolia ETH for deployment
```

### 🔧 **Local Development**
```bash
# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to testnet
npx hardhat run scripts/deploy.js --network optimismSepolia
```

### 🌐 **Network Configuration**
```javascript
// hardhat.config.js
networks: {
  optimismSepolia: {
    url: "https://sepolia.optimism.io",
    chainId: 11155420,
    accounts: [process.env.PRIVATE_KEY]
  }
}
```

## 📊 Contract Analytics

### 📈 **On-Chain Metrics**
- Total USDC staked across all users
- Total CC tokens minted and distributed
- Average staking duration and rewards
- Verification phase distribution
- Environmental impact tracking (hectares)

### 🔍 **Monitoring**
- Real-time transaction monitoring
- Gas usage optimization
- Error rate tracking
- User engagement analytics

## 🛣️ Future Upgrades

### 📅 **Version 2.0 Roadmap**
- [ ] **Multi-token staking**: Support for other stable coins
- [ ] **Governance tokens**: DAO voting mechanisms
- [ ] **NFT integration**: Carbon credit certificates
- [ ] **Oracle integration**: Real-world data feeds
- [ ] **Cross-chain bridges**: Multi-network support

### 🔧 **Technical Enhancements**
- [ ] **Proxy patterns**: Upgradeable contracts
- [ ] **Gas optimization**: Further cost reductions
- [ ] **Batch operations**: Multiple user rewards
- [ ] **Advanced analytics**: ML-powered insights

## 📞 Support & Documentation

### 🆘 **Technical Support**
- **Issues**: GitHub Issues with contract tag
- **Security**: security@mangrovematrix.org
- **Development**: dev@mangrovematrix.org

### 📚 **Additional Resources**
- **ABI Files**: Available in `/src/lib/contracts.ts`
- **Deployment Scripts**: Located in `/scripts/` directory
- **Test Cases**: Found in `/test/` directory
- **Gas Reports**: Generated with `hardhat-gas-reporter`

---

**🔗 Professional-grade smart contracts powering the future of AI-driven environmental restoration! 🌱⛓️**
