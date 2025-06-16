# Staking UI Update Testing Guide

## Issue: "Your Stakes" section not updating after USDC staking

We've implemented several fixes to ensure the UI updates properly:

### ✅ Fixes Applied

1. **Auto-refresh on transaction completion**
2. **Manual refresh button** (refresh icon in "Your Stakes" header)
3. **Window focus refresh** (refreshes when you switch back to the app)
4. **Loading indicators** for staking operations
5. **Diagnostic component** to debug contract connections

### 🧪 Testing Steps

1. **Start the app**: `yarn dev`
2. **Connect your wallet** 
3. **Check the diagnostic section** (only visible in development mode)
   - Should show contract address and connection status
   - Should show "Found 5 regions" 
   - Should show your current staked amount

4. **Test staking flow**:
   - Click on a mangrove region
   - Click "Fund" → "Stake USDC"
   - Complete the staking transaction
   - **Watch for automatic refresh** (should happen when transaction completes)

5. **Manual refresh**:
   - Click the refresh icon (↻) in the "Your Stakes" header
   - Should immediately refresh data

### 🔍 What to Look For

**Before staking:**
- Your Stakes shows: "0.00 USDC"
- CC Tokens: "0.00 CC"

**During staking:**
- Blue loading indicator appears: "Updating staking data..."
- Transaction progress in StakingModal

**After staking:**
- Your Stakes should update to show staked amount
- CC tokens start accumulating (very small amounts initially)
- Verification phase may update

### 🐛 Troubleshooting

**If data still doesn't update:**

1. **Check the diagnostic section** for errors:
   - Red errors = contract connection issues
   - Green checkmarks = working properly

2. **Try manual refresh**:
   - Click the refresh button in "Your Stakes" header
   - Switch to another app and back (triggers window focus refresh)

3. **Check browser console** for JavaScript errors

4. **Verify contract addresses**:
   - Staking contract: `0xCe969D64aABA688415a65A9a032198726eDf270A`
   - CC Token: `0x3D66a37681Aff88F4Eb10De239C0F9Cc3E529844`

### 🔧 Additional Debug Steps

**If you see contract errors:**

1. **Verify setStakingContract was called**:
   - In Remix, connect to CC Token: `0x3D66a37681Aff88F4Eb10De239C0F9Cc3E529844`
   - Call `stakingContract()` - should return: `0xCe969D64aABA688415a65A9a032198726eDf270A`

2. **Test contract directly in Remix**:
   - Connect to MangroveStaking: `0xCe969D64aABA688415a65A9a032198726eDf270A`
   - Call `getAllRegions()` - should return 5 regions
   - Call `getUserTotalStaked(YOUR_ADDRESS)` - should show your stake

### 🎯 Expected Behavior

**Immediate updates**: UI should refresh automatically within 10-15 seconds of transaction completion

**Real-time data**: The "Your Stakes" section now shows live blockchain data, not static values

**Accurate rewards**: CC tokens accumulate at 0.025 per USDC per year (very small amounts initially)

Let me know what you see in the diagnostic section and if the refresh button works!
