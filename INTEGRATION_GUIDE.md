# Contract Integration Setup

## Step 1: Update Contract Addresses

After deploying your contracts, update the addresses in `/src/lib/contracts.ts`:

```typescript
export const CONTRACT_CONFIG = {
  // Replace these with your actual deployed contract addresses
  USDC_ADDRESS: "YOUR_USDC_CONTRACT_ADDRESS_HERE",
  FUNDING_ADDRESS: "YOUR_FUNDING_CONTRACT_ADDRESS_HERE",
  
  // Network configuration (already set for Optimism Sepolia)
  CHAIN_ID: 11155420,
  CHAIN_NAME: "Optimism Sepolia",
  RPC_URL: "https://sepolia.optimism.io",
  BLOCK_EXPLORER: "https://sepolia-optimism.etherscan.io",
  
  // USDC configuration
  USDC_DECIMALS: 6,
  USDC_SYMBOL: "USDC"
};
```

## Step 2: Quick Deployment Reminder

### Option A: Manual Deployment (from your previous session)
1. Deploy USDC contract from `/src/contract/usdc.sol`
2. Deploy Funding contract from `/src/contract/SimpleMangroveMatrixFunding.sol` with USDC address
3. Update the addresses above

### Option B: One-Click Deployment (recommended for demo)
1. Deploy the Deployer contract from `/src/contract/SimpleMangroveMatrixDeployer.sol`
2. Call `deployAndSetup()` function
3. Get the deployed addresses from the transaction events
4. Update the addresses above

## Step 3: Test the Integration

1. **Start the frontend:**
   ```bash
   npm run dev
   ```

2. **Connect your wallet** (MetaMask recommended)

3. **Test the flow:**
   - Mint test USDC using the "Mint Test USDC" button
   - Create a test campaign using the "Create Campaign" tab
   - Contribute to the campaign
   - Test releasing funds or refunds

## Step 4: Features Available

### Campaign Management
- ✅ Create new mangrove restoration campaigns
- ✅ Browse all active campaigns
- ✅ Contribute USDC to campaigns
- ✅ View progress and analytics
- ✅ Release funds when goals are met
- ✅ Refund system for failed campaigns

### Wallet Integration
- ✅ Connect with MetaMask, WalletConnect, etc.
- ✅ Auto-detect Optimism Sepolia network
- ✅ Real-time USDC balance updates
- ✅ Transaction status and confirmations

### UI Features
- ✅ Interactive map with mangrove regions
- ✅ Left panel: Campaign browsing and creation
- ✅ Right panel: Region-specific information
- ✅ Real-time data and progress tracking
- ✅ Responsive design for mobile/desktop

## Step 5: Demo Script

1. **Setup:** "Welcome to MangroveMatrix, a blockchain-powered platform for funding mangrove restoration"

2. **Wallet Connection:** "First, let's connect our wallet to Optimism Sepolia testnet"

3. **Mint USDC:** "For demo purposes, we'll mint some test USDC"

4. **Create Campaign:** "Now let's create a mangrove restoration campaign"

5. **Browse & Contribute:** "We can browse existing campaigns and contribute to them"

6. **Progress Tracking:** "The platform tracks funding progress, carbon credits, and campaign status in real-time"

7. **Map Integration:** "The interactive map shows mangrove regions with health metrics and funding opportunities"

## Troubleshooting

### Common Issues:
1. **"Contract not initialized"** - Make sure wallet is connected and contracts are deployed
2. **"Transaction failed"** - Check if you have enough USDC and gas
3. **"Network mismatch"** - Switch to Optimism Sepolia in your wallet

### Debug Mode:
- Open browser console to see transaction details
- Check wallet for pending transactions
- Verify contract addresses are correctly set

## Next Steps for Production

1. Deploy to Optimism mainnet
2. Use real USDC contract address
3. Add more sophisticated verification mechanisms
4. Implement proper governance and multi-sig
5. Add more detailed carbon credit tracking
6. Integrate with real mangrove monitoring data
