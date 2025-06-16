import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChevronRight, ChevronLeft, Coins, TrendingUp, Leaf, MapPin, AlertCircle, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { optimismSepolia } from 'wagmi/chains';
import { MangroveRegion } from '@/types';
import { contractService } from '@/lib/contractService';
import { CONTRACT_CONFIG, USDC_ABI } from '@/lib/contracts';
import { StakingInfoCard } from './StakingInfoCard';

interface StakingPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  selectedRegion: MangroveRegion | null;
}

export const StakingPanel = ({ isOpen, onToggle, selectedRegion }: StakingPanelProps) => {
  const { address, isConnected } = useAccount();
  
  // Get USDC balance with automatic refresh
  const { data: usdcBalance, error: usdcError, isLoading: usdcLoading, refetch: refetchBalance } = useBalance({
    address,
    token: CONTRACT_CONFIG.USDC_ADDRESS as `0x${string}`,
    query: {
      refetchInterval: 5000, // Refresh every 5 seconds
      staleTime: 2000, // Consider data stale after 2 seconds
    }
  });
  
  // Contract interaction hooks
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });
  
  const [stakeAmount, setStakeAmount] = useState('');
  const [stakedAmount, setStakedAmount] = useState('0.00'); // This would be fetched from contract
  const [carbonCredits, setCarbonCredits] = useState('0.00'); // This would be fetched from contract
  const [showSuccess, setShowSuccess] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);
  const [lastBalanceUpdate, setLastBalanceUpdate] = useState<Date | null>(null);

  // Handle transaction errors with better UX
  useEffect(() => {
    if (writeError) {
      setTxError(writeError.message || 'Transaction failed');
      setTimeout(() => setTxError(null), 5000); // Clear error after 5 seconds
    }
  }, [writeError]);

  // Update last balance update time when balance changes
  useEffect(() => {
    if (usdcBalance && !usdcLoading) {
      setLastBalanceUpdate(new Date());
    }
  }, [usdcBalance, usdcLoading]);

  // Handle successful transaction with better UX
  useEffect(() => {
    if (isConfirmed && hash) {
      setShowSuccess(true);
      
      // Refresh balance after successful transaction
      refetchBalance();
      
      // Update local state to simulate successful staking
      const newStaked = parseFloat(stakedAmount.replace(/,/g, '')) + parseFloat(stakeAmount);
      const newCredits = parseFloat(carbonCredits) + (parseFloat(stakeAmount) * 0.025);
      
      setStakedAmount(newStaked.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }));
      
      setCarbonCredits(newCredits.toFixed(2));
      setStakeAmount('');
      
      // Hide success message after 10 seconds
      setTimeout(() => setShowSuccess(false), 10000);
    }
  }, [isConfirmed, hash, stakeAmount, stakedAmount, carbonCredits, refetchBalance]);

  // Format USDC balance for display
  const displayBalance = usdcBalance && !usdcError ? 
    `${parseFloat(usdcBalance.formatted).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC` : 
    usdcLoading ? 'Loading...' :
    usdcError ? `Error: ${usdcError.message || 'Unknown error'}` :
    '0.00 USDC';

  // Format last update time
  const formatLastUpdate = () => {
    if (!lastBalanceUpdate) return '';
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastBalanceUpdate.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return lastBalanceUpdate.toLocaleTimeString();
  };

  // Function to fetch user data - now simplified since balance comes from wagmi
  const fetchUserData = async () => {
    if (!isConnected || !address) {
      return;
    }

    // Fetch staked amount and carbon credits from contract
    // For now using mock data, but this would call real contracts
    setStakedAmount('500.00');
    setCarbonCredits('12.34');
    
    console.log("Fetching real user data for:", address);
  };
  
  useEffect(() => {
    fetchUserData();
    
    // Set up interval to refresh data every 30 seconds
    const intervalId = setInterval(fetchUserData, 30000);
    
    return () => clearInterval(intervalId);
  }, [isConnected, address]);

  // Add effect to log when selectedRegion changes
  useEffect(() => {
    if (selectedRegion) {
      console.log('Selected region updated:', selectedRegion);
    }
  }, [selectedRegion]);

  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0 || !selectedRegion || !isConnected || !address) return;
    
    // Clear previous errors and success states
    setTxError(null);
    setShowSuccess(false);
    
    try {
      // Convert stake amount to wei (USDC has 6 decimals)
      const amountInWei = parseUnits(stakeAmount, CONTRACT_CONFIG.USDC_DECIMALS);
      
      // Transfer USDC to owner address (basic staking)
      writeContract({
        address: CONTRACT_CONFIG.USDC_ADDRESS as `0x${string}`,
        abi: USDC_ABI,
        functionName: 'transfer',
        args: [CONTRACT_CONFIG.OWNER_ADDRESS as `0x${string}`, amountInWei],
        chain: optimismSepolia,
        account: address,
      });
      
    } catch (error) {
      setTxError(error instanceof Error ? error.message : 'Staking failed. Please try again.');
    }
  };
  
  // Format coordinates for display
  const formatCoordinates = () => {
    if (!selectedRegion || typeof selectedRegion.lat !== 'number' || typeof selectedRegion.lng !== 'number') {
      return 'None selected';
    }
    return `${selectedRegion.lat.toFixed(2)}°, ${selectedRegion.lng.toFixed(2)}°`;
  };
  
  // Calculate the impact per USDC based on the selected region
  const calculateImpactPerUSDC = () => {
    if (!selectedRegion) return null;
    
    // Calculate hectares that can be supported per USDC (roughly $200/hectare)
    const hectaresPerUSDC = 1 / 200;
    
    // Carbon sequestration per USDC (based on region's sequestration rate)
    const carbonPerUSDC = selectedRegion.carbon_sequestration_tpy 
      ? (selectedRegion.carbon_sequestration_tpy / selectedRegion.area_hectares) * hectaresPerUSDC
      : 0.25; // default if no data
    
    return {
      hectaresPerUSDC,
      carbonPerUSDC
    };
  };
  
  // Get impact estimates based on current stake amount
  const getImpactEstimates = () => {
    const impact = calculateImpactPerUSDC();
    if (!impact || !stakeAmount || parseFloat(stakeAmount) <= 0) return null;
    
    const amount = parseFloat(stakeAmount);
    return {
      hectares: (impact.hectaresPerUSDC * amount).toFixed(2),
      carbonSequestration: (impact.carbonPerUSDC * amount).toFixed(2)
    };
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
                
                {/* Impact estimates based on stake amount */}
                {stakeAmount && parseFloat(stakeAmount) > 0 && selectedRegion && (
                  <div className="mt-2 p-2 rounded bg-gray-700/50 border border-gray-600/50">
                    <p className="text-xs text-blue-400 font-medium mb-1">Estimated Impact:</p>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Area Protected:</span>
                      <span className="text-white">{parseFloat(stakeAmount) / 200} hectares</span>
                    </div>
                    {selectedRegion.carbon_sequestration_tpy && (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Carbon Offset:</span>
                        <span className="text-green-400">
                          ~{(selectedRegion.carbon_sequestration_tpy / selectedRegion.area_hectares * (parseFloat(stakeAmount) / 200)).toFixed(2)} tons/year
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Balance:</span>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-2">
                    <span className="text-white">{isConnected ? displayBalance : 'Not connected'}</span>
                    {isConnected && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => refetchBalance()}
                        disabled={usdcLoading}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                        title="Refresh balance"
                      >
                        <div className={`w-3 h-3 ${usdcLoading ? 'animate-spin' : ''}`}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                          </svg>
                        </div>
                      </Button>
                    )}
                  </div>
                  {isConnected && lastBalanceUpdate && (
                    <span className="text-xs text-gray-500">Updated {formatLastUpdate()}</span>
                  )}
                </div>
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
              
              {selectedRegion && selectedRegion.country && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Country:</span>
                  <span className="text-white">{selectedRegion.country}</span>
                </div>
              )}
              
              {selectedRegion && selectedRegion.area_hectares && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Area:</span>
                  <span className="text-white">{selectedRegion.area_hectares.toFixed(1)} hectares</span>
                </div>
              )}
              
              {selectedRegion && selectedRegion.health && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Health Index:</span>
                  <span className={`font-medium ${
                    selectedRegion.health > 80 ? 'text-green-400' : 
                    selectedRegion.health > 60 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {typeof selectedRegion.health === 'number' ? selectedRegion.health.toFixed(1) : 'N/A'}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Est. Gas:</span>
                <span className="text-white">~$2.50</span>
              </div>

              <Button
                onClick={handleStake}
                disabled={!stakeAmount || parseFloat(stakeAmount) <= 0 || isPending || isConfirming || !selectedRegion || !isConnected}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                {isPending ? 'Confirming...' : isConfirming ? 'Processing...' : !isConnected ? 'Connect Wallet First' : !selectedRegion ? 'Select Region First' : 'Stake USDC'}
              </Button>

              {/* Transaction Status Notifications */}
              {isPending && (
                <Alert className="bg-blue-900/30 border-blue-400/30">
                  <Clock className="h-4 w-4 text-blue-400" />
                  <AlertDescription className="text-blue-200">
                    Please confirm the transaction in your wallet...
                  </AlertDescription>
                </Alert>
              )}

              {isConfirming && (
                <Alert className="bg-yellow-900/30 border-yellow-400/30">
                  <Clock className="h-4 w-4 text-yellow-400" />
                  <AlertDescription className="text-yellow-200">
                    Transaction submitted! Waiting for confirmation...
                  </AlertDescription>
                </Alert>
              )}

              {showSuccess && hash && (
                <Alert className="bg-green-900/30 border-green-400/30">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <AlertDescription className="text-green-200">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>Staking successful! USDC has been transferred.</div>
                        <button 
                          onClick={() => setShowSuccess(false)}
                          className="text-green-300 hover:text-green-100 ml-2"
                        >
                          ×
                        </button>
                      </div>
                      <a 
                        href={`${CONTRACT_CONFIG.BLOCK_EXPLORER}/tx/${hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-green-300 hover:text-green-100 underline text-sm"
                      >
                        View transaction <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {txError && (
                <Alert className="bg-red-900/30 border-red-400/30">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-200">
                    <div className="flex justify-between items-start">
                      <div>{txError}</div>
                      <button 
                        onClick={() => setTxError(null)}
                        className="text-red-300 hover:text-red-100 ml-2"
                      >
                        ×
                      </button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Environmental Impact Card - Only shown when a region is selected */}
          {selectedRegion && (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg flex items-center">
                  <Leaf className="w-5 h-5 mr-2 text-green-400" />
                  Environmental Impact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedRegion.flood_protection_m && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Flood Protection</span>
                    <span className="text-blue-400 font-semibold">{selectedRegion.flood_protection_m}m</span>
                  </div>
                )}
                {selectedRegion.carbon_sequestration_tpy && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Carbon Sequestration</span>
                    <span className="text-green-400 font-semibold">{selectedRegion.carbon_sequestration_tpy} t/yr</span>
                  </div>
                )}
                {selectedRegion.biodiversity_index && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Biodiversity Index</span>
                    <span className="text-yellow-400 font-semibold">{selectedRegion.biodiversity_index.toFixed(2)}</span>
                  </div>
                )}
                {selectedRegion.economic_value_usd && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Economic Value</span>
                    <span className="text-white font-semibold">${(selectedRegion.economic_value_usd / 1000).toFixed(0)}K/yr</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Your Stakes - Now using StakingInfoCard component */}
          <StakingInfoCard />
        </div>
      </div>
    </>
  );
};
