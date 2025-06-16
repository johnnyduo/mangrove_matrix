#!/bin/bash

# MangroveMatrix Deployment Script for Vercel
echo "🚀 Starting MangroveMatrix deployment..."

# Create .env.production file if it doesn't exist
if [ ! -f ".env.production" ]; then
  echo "📝 Creating .env.production file..."
  echo "VITE_USE_MOCK_WALLET=true" > .env.production
  echo "# Add your Mapbox token here for production" >> .env.production
  echo "# VITE_MAPBOX_TOKEN=your_mapbox_token_here" >> .env.production
fi

# Make sure the processed GMW data is available
if [ ! -f "src/data/processed_gmw_mangroves.json" ]; then
  echo "🔄 Processing GMW data..."
  node src/data/process_gmw_data.js
else
  echo "✅ Professional GMW dataset found."
fi

# Install dependencies with yarn for better reliability
echo "📦 Installing dependencies..."
yarn install --frozen-lockfile

# Build the application
echo "🏗️ Building application..."
yarn build

if [ -d "dist" ]; then
  echo "✅ Build complete! Deployment bundle ready in 'dist' folder"
  echo "📊 Bundle size:"
  du -sh dist
  
  # List largest files
  echo "🔍 Largest files in bundle:"
  find dist -type f -exec du -h {} \; | sort -hr | head -n 5
else
  echo "❌ Build failed! Check for errors above."
  exit 1
fi

echo ""
echo "===== DEPLOYMENT INSTRUCTIONS ====="
echo "1. Deploy to Vercel with these settings:"
echo "   - Framework preset: Vite"
echo "   - Build command: npm run build"
echo "   - Output directory: dist"
echo "   - Install command: npm install"
echo ""
echo "2. Don't forget to add your Mapbox token to the Vercel environment variables"
echo "=============================="

echo "✨ Deployment preparation completed successfully!"
