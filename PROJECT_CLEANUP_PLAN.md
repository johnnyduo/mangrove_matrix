# MangroveMatrix Project Cleanup Plan

## 🗑️ **Files to Remove (Redundant/Unused)**

### **Component Files (Unused/Old Versions)**
- `src/components/CampaignsPanel.tsx` - Not imported in App.tsx, unused
- `src/components/FundingModalOld.tsx` - Old version, unused  
- `src/components/FundingModalNew.tsx` - Redundant, FundingModal.tsx is the active one
- `src/components/StakingPanel_old.tsx` - Old version backup, unused
- `src/components/StakingPanel_new.tsx` - Old version backup, unused

### **Hook Files (Unused)**
- `src/hooks/use-staking-test.ts` - Testing hook, no longer used after removing dev UI
- `src/hooks/use-cc-mint.ts` - Unused minting hook
- `src/hooks/useContracts.tsx` - Only used by removed CampaignsPanel

### **Contract Files (Unused/Redundant)**
- `src/contract/SimpleStakingContract.sol` - Simple version, not used
- `src/contract/SimpleMangroveMatrixFunding.sol` - Simple version, superseded by MangroveStaking
- `src/contract/SimpleMangroveMatrixDeployer.sol` - Simple version deployer, not used
- `src/contract/MangroveMatrixDeployer.sol` - Old deployer, not used
- `src/contract/MangroveMatrixFunding.sol` - Old funding contract, superseded by MangroveStaking
- `src/contract/TestCompilation.sol` - Test file, not needed
- `src/contract/usdc.sol` - Not used (using external USDC)

### **Documentation Files (Redundant)**
- `README_OLD.md` - Old version of README
- `CONTRACT_README_NEW.md` - Redundant with src/contract/README.md
- `src/contract/SIMPLE_README.md` - Documentation for removed simple contracts
- `INTEGRATION_GUIDE.md` - Superseded by CONTRACT_DEPLOYMENT.md
- `INTEGRATION_COMPLETE.md` - Temporary status file
- `CLEANUP_COMPLETE.md` - Old cleanup status
- `DATA_MANAGEMENT.md` - Outdated data documentation
- `DATASET_SUMMARY.md` - Outdated dataset info

### **Config/Build Files (Redundant)**
- `env.production` - Duplicate of .env.production
- `deploy.sh` - Basic deploy script, superseded by quick-redeploy.sh

### **Lib Files (Unused)**
- `src/lib/MockWalletProvider.tsx` - Mock provider, not used in production
- `src/lib/demoData.ts` - Demo data, using real data now
- `src/lib/fetchMangrove3DGeoJSON.ts` - Unused fetcher

## ✅ **Files to Keep (Active/Important)**

### **Core Components**
- `src/components/StakingPanel.tsx` - Main staking interface
- `src/components/FundingModal.tsx` - Active funding modal
- `src/components/StakingModal.tsx` - Staking modal
- `src/components/StakingInfoCard.tsx` - User stakes display
- `src/components/DetailDrawer.tsx` - Region details
- `src/components/MapCanvas.tsx` - Main map
- All UI components in `src/components/ui/`

### **Active Hooks**
- `src/hooks/use-mangrove-staking.ts` - Main staking hook
- `src/hooks/use-carbon-credit.ts` - CC token management
- `src/hooks/use-faucet.ts` - USDC faucet functionality

### **Production Contracts**
- `src/contract/MangroveStaking.sol` - Main staking contract
- `src/contract/CarbonCreditToken.sol` - CC token contract

### **Core Configuration**
- `src/lib/contracts.ts` - Contract addresses and ABIs
- `src/lib/contractService.ts` - Contract interaction service

### **Important Documentation**
- `README.md` - Main project documentation
- `README_ADVANCED.md` - Advanced setup guide
- `CONTRACT_DEPLOYMENT.md` - Deployment instructions
- `STAKING_UI_DEBUG.md` - Debug guide
- Recent update documentation files

## 🎯 **Cleanup Benefits**

1. **Reduced Bundle Size** - Remove unused code
2. **Clearer Codebase** - Eliminate confusion from old/duplicate files
3. **Easier Maintenance** - Fewer files to manage
4. **Better Performance** - Less code to parse/build

## ⚠️ **Safety Notes**

- Keep `.git/` and `node_modules/` untouched
- Keep all files in `src/components/ui/` (shadcn components)
- Keep `dist/` for builds
- Verify no hidden dependencies before deletion
