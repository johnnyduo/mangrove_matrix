#!/bin/bash

# Quick Redeploy Script for Faster CC Emission Rate
# This script redeploys the contracts with 100x faster CC emission (2.5 CC per USDC per year)

echo "🚀 Redeploying contracts with faster CC emission rate..."

# Compile contracts
echo "📦 Compiling contracts..."
npx hardhat compile

if [ $? -ne 0 ]; then
    echo "❌ Compilation failed!"
    exit 1
fi

# Deploy contracts
echo "🌐 Deploying contracts..."
npx hardhat run scripts/deploy.js --network localhost

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo ""
    echo "🎯 New CC Emission Rate: 2.5 CC per USDC per year (100x faster)"
    echo ""
    echo "📋 Next steps:"
    echo "1. Copy the new contract addresses from the deployment output"
    echo "2. Update the contract addresses in your frontend (src/lib/contracts.ts)"
    echo "3. Call setStakingContract() on the new CarbonCreditToken contract"
    echo "4. Test the new faster emission rate!"
    echo ""
    echo "💡 With this rate, you'll see rewards accumulating much faster:"
    echo "   - 100 USDC staked = ~250 CC per year"
    echo "   - That's about 0.69 CC per day"
    echo "   - Or about 0.029 CC per hour!"
else
    echo "❌ Deployment failed!"
    exit 1
fi
