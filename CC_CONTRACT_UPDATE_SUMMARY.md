# CarbonCredit Token Address Update Summary

## Contract Address Updated

**Old Address:** `0x11b13b3cF56c9D353512a6a9dE1e68f962284ba1`
**New Address:** `0x3D66a37681Aff88F4Eb10De239C0F9Cc3E529844`

## Files Updated

### ✅ Core Configuration
- `src/lib/contracts.ts` - Main contract configuration (Line 6)

### ✅ Documentation Files
- `STAKING_UI_DEBUG.md` - Debug guide references (2 locations)
- `src/contract/README.md` - Contract documentation table
- `CONTRACT_README_NEW.md` - Contract documentation table
- `README_ADVANCED.md` - Contract addresses section (2 locations)
- `README.md` - Contract addresses section (2 locations)

## Next Steps

1. **Restart Development Server** (if running):
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

2. **Verify Contract Configuration**:
   - The app will now connect to the new CarbonCredit token contract
   - All staking operations will use the updated contract
   - CC token rewards will come from the new contract

3. **Test the Integration**:
   - Connect your wallet
   - Try staking USDC
   - Verify CC token rewards are working
   - Check that the new faster emission rate (2.5 CC/USDC/year) is active

## Important Notes

- The new contract should already have the faster emission rate (2.5 CC per USDC per year) if it was deployed with the updated code
- Make sure the MangroveStaking contract is properly connected to this new CarbonCredit token address
- If you need to call `setStakingContract()` on the new token, use the existing MangroveStaking address: `0xCe969D64aABA688415a65A9a032198726eDf270A`

## Verification

You can verify the contract update by checking:
1. The browser console for any contract connection errors
2. The "Your Stakes" section should show data from the new contract
3. Staking operations should complete successfully
4. CC rewards should accumulate at the new faster rate
