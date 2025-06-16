# 🌿 MangroveMatrix - AI-Enhanced Blockchain Mangrove Restoration

**Professional mangrove restoration funding platform combining AI predictions with real-world data and blockchain integrati## ⚡ Key AI + Blockchain Features

- **Intelligent 3D Globe**: AI-enhanced visualization with smart environmental data overlays
- **Machine Learning Health Assessment**: Real-time AI analysis of mangrove ecosystem health indicators
- **Smart Region Recommendations**: AI-powered suggestions for optimal restoration funding
- **Blockchain Staking Integration**: Seamless USDC transactions powered by advanced wallet technology
- **AI Impact Calculator**: Machine learning models predict real-world environmental impact of contributionsangroveMatrix is a cutting-edge platform that harnesses the power of **Artificial Intelligence** and **blockchain technology** to revolutionize mangrove restoration funding. Our AI models analyze real Global Mangrove Watch (GMW) v3 2020 data to predict environmental health, assess restoration potential, and guide intelligent funding decisions for 50,000+ mangrove locations worldwide. Combined with seamless USDC-based blockchain transactions on Optimism Sepolia, we create a data-driven, AI-enhanced approach to climate action.

## 🚀 Key Features

### 🧠 AI-Enhanced Environmental Intelligence
- **Machine Learning Models**: Advanced AI algorithms predict mangrove ecosystem health and restoration potential
- **Smart Risk Assessment**: AI-powered analysis of environmental threats, climate impacts, and conservation priorities  
- **Predictive Analytics**: Forecast long-term impact of climate change on mangrove ecosystems
- **Data-Driven Insights**: AI processes massive real-world datasets to guide optimal funding allocation
- **Intelligent Recommendations**: ML-powered suggestions for highest-impact restoration projects

### 🌍 Real-World Data Integration
- **GMW v3 2020 Dataset**: 50,000+ real mangrove locations from Global Mangrove Watch
- **Professional Data Processing**: Optimized 22.64MB dataset with country mapping
- **Geographic Precision**: 3-decimal coordinate precision for accurate location data
- **Global Coverage**: Comprehensive mangrove data from around the world

### 💰 Blockchain Integration  
- **Real Wallet Connection**: WalletConnect/AppKit integration with latest Reown technology
- **USDC Staking**: Direct USDC transfers on Optimism Sepolia testnet
- **Transaction Tracking**: Real-time transaction status with block explorer links
- **Professional UX**: Seamless wallet connection and transaction flow

### 📊 Interactive AI-Powered Visualization
- **3D Globe Interface**: Smooth MapBox GL JS visualization with AI-enhanced mangrove overlays
- **AI-Enhanced Region Display**: Visual representation of machine learning health predictions and risk scores
- **Smart Region Selection**: AI-guided recommendations for optimal funding targets
- **Performance Optimized**: Efficiently handles 50K+ data points with real-time AI analysis
- **Live AI Insights**: Real-time display of AI-computed environmental metrics and predictions

### 🎨 Professional UI/UX
- **Modern Design**: Clean, responsive interface with shadcn/ui components
- **Smart Notifications**: Beautiful transaction status alerts (no more popups!)
- **Progress Tracking**: Visual feedback for all transaction states
- **Mobile Responsive**: Works seamlessly across all device sizes

## 🌍 AI-Driven Environmental Impact

- **AI-Guided Conservation**: Machine learning algorithms identify the most critical restoration areas based on complex environmental factors
- **Predictive Coastal Protection**: AI models forecast how mangrove restoration will impact storm surge protection and sea-level rise mitigation
- **Smart Carbon Sequestration**: AI-optimized funding allocation to maximize CO2 capture and storage potential
- **Biodiversity Intelligence**: ML analysis of habitat connectivity and species conservation priorities  
- **Community Impact Modeling**: AI-powered assessment of socioeconomic benefits for coastal communities

## �️ Technology Stack

- **Frontend**: React 18 + TypeScript + Vite 5
- **AI/ML**: Environmental health prediction models and risk assessment
- **UI/UX**: TailwindCSS + shadcn/ui components + Lucide icons  
- **Blockchain**: wagmi v2 + viem + @reown/appkit (WalletConnect v3)
- **Visualization**: MapBox GL JS with real GMW mangrove data overlay
- **Network**: Optimism Sepolia testnet
- **Data**: Global Mangrove Watch v3 2020 (50,000 optimized features)

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript + Vite 5
- **AI/ML**: Environmental health prediction models, risk assessment algorithms, and data-driven recommendation systems
- **UI/UX**: TailwindCSS + shadcn/ui components + Lucide icons  
- **Blockchain**: wagmi v2 + viem + @reown/appkit (WalletConnect v3)
- **Visualization**: MapBox GL JS with AI-enhanced mangrove data overlays
- **Network**: Optimism Sepolia testnet
- **Data**: Global Mangrove Watch v3 2020 (50,000 AI-processed features)

## 🌐 Blockchain Details

- **Network**: Optimism Sepolia (Chain ID: 11155420)
- **Token**: USDC (Contract: `0xf0E7410525D28d642c367530Add29931826071eC`)
- **Explorer**: [OP Sepolia Etherscan](https://sepolia-optimistic.etherscan.io)
- **Wallet Support**: All major wallets via WalletConnect v3
- **Transaction Type**: Direct USDC transfers for mangrove funding

## 💻 Development

### Prerequisites
- Node.js 18+ or Bun
- Git
- WalletConnect Project ID from [cloud.reown.com](https://cloud.reown.com)

### Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd MangroveMatrix

# Install dependencies (using yarn is recommended)
yarn install

# Set up environment variables
cp .env.example .env
# Edit .env and add your WalletConnect Project ID and MapBox token

# Start development server
yarn dev
```

Visit `http://localhost:8080` to see the application.

### Environment Setup

Create a `.env` file with the following variables:

```bash
# Required: WalletConnect Project ID from https://cloud.reown.com
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here

# Optional: MapBox token for enhanced map features  
VITE_MAPBOX_TOKEN=your_mapbox_token_here
```

### Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production  
- `yarn build:dev` - Build in development mode
- `yarn preview` - Preview production build
- `yarn lint` - Run ESLint

## 🚀 Deployment

### Vercel Deployment (Recommended)
The application is optimized for Vercel deployment:

```bash
# Use the provided deployment script
chmod +x deploy.sh
./deploy.sh
```

This script will:
1. Check and install dependencies
2. Verify environment configuration  
3. Build the application using esbuild for large dataset optimization
4. Deploy to Vercel

### Environment Variables for Production
Set the following in your deployment platform:

```bash
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here
VITE_MAPBOX_TOKEN=your_mapbox_token_here
```

### Build Optimization
The app uses esbuild minifier specifically to handle the 22.64MB GMW dataset efficiently:

```json
{
  "build": {
    "minify": "esbuild",
    "chunkSizeWarningLimit": 1024
  }
}
```

## 📊 Data Information

### Global Mangrove Watch Integration
- **Source**: GMW v3 2020 (most recent comprehensive dataset)
- **Features**: 50,000 mangrove locations (optimized from 2.3M+ original)
- **Coverage**: Global mangrove coverage with country mapping
- **Processing**: Custom Node.js script with geographic optimization
- **File Size**: 22.64MB (under deployment limits)
- **Format**: GeoJSON with country codes and coordinate precision

See `DATASET_SUMMARY.md` for detailed data processing information.

## 🔧 AI & Blockchain Configuration

### AI Models
The platform uses machine learning models to enhance environmental decision-making:
- Environmental health prediction algorithms
- Risk assessment and threat analysis models  
- Impact forecasting and recommendation systems
- Real-time data processing for 50,000+ locations

### Blockchain Integration
For blockchain functionality, ensure proper wallet connection setup:

- `.env` for development
- `.env.production` for production builds

### MapBox Visualization
Enhanced geographic visualization requires MapBox token configuration in your environment files.

## � Key Features

- **Performant 3D Globe**: Smooth rotation and interaction with the Earth visualization
- **AI-Enhanced Data**: View AI-predicted environmental metrics for mangrove health
- **Region Details**: Click on mangrove regions to see detailed environmental data
- **Staking Simulator**: Experience the full staking flow with mock USDC
- **Impact Calculator**: See the real-world impact of your contributions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🌟 Acknowledgments

- **Global Mangrove Watch**: For providing comprehensive mangrove location data
- **Optimism**: For sustainable blockchain infrastructure
- **Reown (WalletConnect)**: For seamless wallet integration technology  
- **MapBox**: For powerful geographic visualization capabilities
- **shadcn/ui**: For beautiful, accessible UI components
- **Climate Action**: Built to support UN Sustainable Development Goals

## 📈 Future AI + Blockchain Roadmap

- [ ] **Advanced AI Models**: Deep learning for satellite imagery analysis and real-time monitoring
- [ ] **Smart Contract AI Integration**: Deploy AI-powered automated staking contracts
- [ ] **Carbon Credit NFTs**: AI-verified, tokenized carbon credits with ML impact validation
- [ ] **DAO + AI Governance**: Community-driven decisions enhanced by AI recommendations
- [ ] **Satellite AI Verification**: Machine learning integration with satellite imagery for impact tracking
- [ ] **Mainnet + Production AI**: Full deployment with production-grade AI models on Optimism mainnet

---

**🌊 Join the AI-powered movement to restore our planet's coastal ecosystems through intelligent blockchain technology! 🧠🌿**

*Built with ❤️ for climate action, environmental conservation, and the power of artificial intelligence*
