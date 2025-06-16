
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronLeft, Coins, TrendingUp, Leaf, MapPin, AlertCircle } from 'lucide-react';
import { useAccount } from 'wagmi';
import { MangroveRegion } from '@/types';

interface StakingPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  selectedRegion: MangroveRegion | null;
}

export const StakingPanel = ({ isOpen, onToggle, selectedRegion }: StakingPanelProps) => {
  const { address, isConnected } = useAccount();
  const [stakeAmount, setStakeAmount] = useState('');
  const [isStaking, setIsStaking] = useState(false);
  const [usdcBalance, setUsdcBalance] = useState('0.00');
  
  // USDC contract address on Optimism Sepolia testnet
  // Note: For demo purposes, we're using a mock address. In production, use the actual USDC contract address
  const USDC_CONTRACT_ADDRESS = '0xFa081F90a1dbB9ceEeB910fa7966D2BA0e5EE0A2';
  const USDC_ABI = [
    // ERC20 balanceOf function
    'function balanceOf(address owner) view returns (uint256)',
    // ERC20 decimals function
    'function decimals() view returns (uint8)'
  ];

  // Fetch USDC balance when wallet is connected
  useEffect(() => {
    const fetchBalance = async () => {
      if (!isConnected || !address) {
        setUsdcBalance('0.00');
        return;
      }

      try {
        // Import ethers dynamically to avoid SSR issues
        const { ethers } = await import('ethers');
        
        // Use a public RPC provider for Optimism Sepolia
        const provider = new ethers.JsonRpcProvider('https://sepolia.optimism.io');
        
        // Create contract instance
        const usdcContract = new ethers.Contract(
          USDC_CONTRACT_ADDRESS,
          USDC_ABI,
          provider
        );
        
        // Default decimals for USDC (typically 6)
        let decimals = 6;
        let balance = 0n;
        
        // Try to get decimals, but use default if it fails
        try {
          decimals = await usdcContract.decimals();
        } catch (decimalError) {
          console.warn('Could not fetch decimals, using default value of 6:', decimalError);
          // Continue with default decimals
        }
        
        // Try to get balance
        try {
          balance = await usdcContract.balanceOf(address);
        } catch (balanceError) {
          console.warn('Could not fetch balance, using 0:', balanceError);
          // Continue with zero balance
        }
        
        // Format balance with proper decimals
        const formattedBalance = ethers.formatUnits(balance, decimals);
        
        // Format with commas for display
        setUsdcBalance(parseFloat(formattedBalance).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }));
      } catch (error) {
        console.error('Error in USDC balance fetching process:', error);
        // For demo purposes, use mock data instead of showing an error to the user
        setUsdcBalance('1,250.00');
      }
    };
    
    fetchBalance();
    
    // Set up interval to refresh balance every 30 seconds
    const intervalId = setInterval(fetchBalance, 30000);
    
    return () => clearInterval(intervalId);
  }, [isConnected, address]);

  // Add effect to log when selectedRegion changes
  useEffect(() => {
    if (selectedRegion) {
      console.log('Selected region updated:', selectedRegion);
    }
  }, [selectedRegion]);

  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0 || !selectedRegion || !isConnected) return;
    
    setIsStaking(true);
    try {
      // Mock staking process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, you would call a smart contract to stake USDC for the selected region
      console.log(`Staked ${stakeAmount} USDC for region: ${selectedRegion.name || 'Unnamed'} at coordinates: ${selectedRegion.lat?.toFixed(4)}, ${selectedRegion.lng?.toFixed(4)}`);
      
      // Clear stake amount after successful stake
      setStakeAmount('');
      
      // You could also trigger a refresh of the user's staked amount here
    } catch (error) {
      console.error('Staking failed:', error);
    } finally {
      setIsStaking(false);
    }
  };
  
  // Format coordinates for display
  const formatCoordinates = () => {
    if (!selectedRegion || typeof selectedRegion.lat !== 'number' || typeof selectedRegion.lng !== 'number') {
      return 'None selected';
    }
    return `${selectedRegion.lat.toFixed(2)}°, ${selectedRegion.lng.toFixed(2)}°`;
  };

  return (
    <>
      {/* Toggle Button */}
      <Button
        onClick={onToggle}
        className="fixed right-4 top-1/2 transform -translate-y-1/2 z-40 bg-blue-600 hover:bg-blue-700 rounded-l-lg rounded-r-none shadow-lg"
        size="sm"
      >
        {isOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </Button>

      {/* Panel */}
      <div className={`fixed right-0 top-16 h-[calc(100vh-64px)] w-80 bg-gray-900/95 backdrop-blur-sm border-l border-gray-800 transition-transform duration-300 ease-in-out z-30 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-6 space-y-6 h-full overflow-y-auto">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-white mb-2">Mangrove Staking</h2>
            <p className="text-gray-400 text-sm">Stake USDC to fund mangrove restoration and receive CC tokens based on verification proofs</p>
          </div>

          {/* Pool Statistics */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-lg flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
                Pool Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">TVL</span>
                <span className="text-white font-semibold">$2.4M</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">APY</span>
                <Badge className="bg-green-600 text-white">12.5%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Hectares Funded</span>
                <span className="text-green-400 font-semibold">1,247</span>
              </div>
            </CardContent>
          </Card>

          {/* Staking Interface */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-lg flex items-center">
                <Coins className="w-5 h-5 mr-2 text-blue-400" />
                Stake USDC
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Amount</label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white pr-12"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                    USDC
                  </span>
                </div>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Balance:</span>
                <span className="text-white">{isConnected ? `${usdcBalance} USDC` : 'Not connected'}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Selected Region:</span>
                <span className="text-white flex items-center">
                  {selectedRegion ? (
                    <>
                      <MapPin className="w-3 h-3 mr-1 text-blue-400" />
                      {selectedRegion.name || 'Unnamed'}
                    </>
                  ) : (
                    <span className="text-yellow-400 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      None selected
                    </span>
                  )}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Coordinates:</span>
                <span className="text-white">{formatCoordinates()}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Est. Gas:</span>
                <span className="text-white">~$2.50</span>
              </div>

              <Button
                onClick={handleStake}
                disabled={!stakeAmount || parseFloat(stakeAmount) <= 0 || isStaking || !selectedRegion || !isConnected}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                {isStaking ? 'Staking...' : !isConnected ? 'Connect Wallet First' : !selectedRegion ? 'Select Region First' : 'Stake USDC'}
              </Button>
            </CardContent>
          </Card>

          {/* Your Stakes */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-lg flex items-center">
                <Leaf className="w-5 h-5 mr-2 text-green-400" />
                Your Stakes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Staked</span>
                <span className="text-white font-semibold">500.00 USDC</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">CC Tokens Earned</span>
                <span className="text-green-400 font-semibold">+12.34 CC</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Hectares Supported</span>
                <span className="text-green-400 font-semibold">2.5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Verification Phase</span>
                <span className="text-yellow-400 font-semibold">1/3</span>
              </div>
              <Button
                variant="outline"
                className="w-full border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
                size="sm"
              >
                Claim CC Tokens
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};
