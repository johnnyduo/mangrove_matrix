import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import { 
  MapPin, 
  TreePine, 
  DollarSign, 
  Leaf, 
  Shield, 
  TrendingUp,
  CheckCircle,
  Clock,
  Users,
  Target,
  Wallet,
  ExternalLink
} from "lucide-react";
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { optimismSepolia } from 'wagmi/chains';
import { CONTRACT_CONFIG, USDC_ABI } from '@/lib/contracts';
import { MangroveRegion } from '@/types';
import { toast } from 'sonner';

interface FundingModalProps {
  isOpen: boolean;
  onClose: () => void;
  region: MangroveRegion | null;
}

export const FundingModal: React.FC<FundingModalProps> = ({
  isOpen,
  onClose,
  region
}) => {
  const { address, isConnected } = useAccount();
  const [fundingAmount, setFundingAmount] = useState('');
  const [step, setStep] = useState<'input' | 'confirmation' | 'success'>('input');
  
  // Get USDC balance
  const { data: usdcBalance, refetch: refetchBalance } = useBalance({
    address,
    token: CONTRACT_CONFIG.USDC_ADDRESS as `0x${string}`,
  });

  // Contract interaction
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Reset modal state when opening
  useEffect(() => {
    if (isOpen) {
      setStep('input');
      setFundingAmount('');
    }
  }, [isOpen]);

  // Handle successful transaction
  useEffect(() => {
    if (isConfirmed && hash) {
      setStep('success');
      refetchBalance();
      toast.success(`Successfully funded ${fundingAmount} USDC!`, {
        description: `Transaction: ${hash.slice(0, 10)}...`,
      });
    }
  }, [isConfirmed, hash, fundingAmount, refetchBalance]);

  // Handle transaction errors
  useEffect(() => {
    if (writeError) {
      toast.error('Funding failed', {
        description: writeError.message || 'Transaction failed',
      });
    }
  }, [writeError]);

  if (!region) return null;

  const fundingAmountNum = parseFloat(fundingAmount) || 0;
  const userBalance = usdcBalance ? parseFloat(usdcBalance.formatted) : 0;

  // Calculate estimated impact
  const calculateImpact = () => {
    if (!fundingAmountNum) return null;
    
    const hectaresProtected = fundingAmountNum / 200; // $200 per hectare
    const carbonCredits = hectaresProtected * 2.5; // 2.5 tons CO2/hectare/year
    const biodiversityImpact = hectaresProtected * 15; // 15 species supported per hectare
    
    return {
      hectares: hectaresProtected,
      carbonCredits,
      biodiversity: biodiversityImpact,
      communityJobs: Math.floor(hectaresProtected / 10), // 1 job per 10 hectares
    };
  };

  const impact = calculateImpact();

  const handleFunding = async () => {
    if (!fundingAmountNum || !isConnected || !address) return;
    
    if (fundingAmountNum > userBalance) {
      toast.error('Insufficient balance');
      return;
    }

    try {
      const amountInWei = parseUnits(fundingAmount, CONTRACT_CONFIG.USDC_DECIMALS);
      
      writeContract({
        address: CONTRACT_CONFIG.USDC_ADDRESS as `0x${string}`,
        abi: USDC_ABI,
        functionName: 'transfer',
        args: [CONTRACT_CONFIG.FUNDING_ADDRESS as `0x${string}`, amountInWei],
        chain: optimismSepolia,
        account: address,
      });
      
      setStep('confirmation');
    } catch (error) {
      toast.error('Funding failed', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const handleClose = () => {
    if (step !== 'confirmation') {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-gray-900 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-green-400 flex items-center gap-2">
            <TreePine className="h-5 w-5" />
            Fund This Area - {region.name || 'Mangrove Area'}
          </DialogTitle>
        </DialogHeader>

        {step === 'input' && (
          <div className="space-y-6">
            {/* Area Information */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Area Details
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Country:</span>
                  <span>{region.country || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Size:</span>
                  <span>{region.area_hectares ? `${region.area_hectares.toLocaleString()} ha` : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Health Status:</span>
                  <Badge variant={region.health && region.health > 0.7 ? 'default' : 'secondary'}>
                    {region.health ? `${Math.round(region.health * 100)}%` : 'N/A'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Protection Level:</span>
                  <Badge variant="outline">
                    {region.protection_level || 'Medium'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Funding Input */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-blue-400 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Funding Amount
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Your Balance:</span>
                    <span className="text-white">
                      {userBalance.toLocaleString()} USDC
                    </span>
                  </div>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="Enter USDC amount"
                      value={fundingAmount}
                      onChange={(e) => setFundingAmount(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white pl-12"
                      min="0"
                      step="0.01"
                    />
                    <DollarSign className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                  </div>
                  <div className="flex gap-2">
                    {[100, 500, 1000].map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        onClick={() => setFundingAmount(amount.toString())}
                        className="bg-gray-700 border-gray-600 hover:bg-gray-600"
                        disabled={amount > userBalance}
                      >
                        ${amount}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Impact Estimation */}
            {impact && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-green-400 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Estimated Impact
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-700 rounded">
                    <TreePine className="h-8 w-8 text-green-400 mx-auto mb-2" />
                    <p className="text-lg font-bold text-green-400">{impact.hectares.toFixed(1)} ha</p>
                    <p className="text-xs text-gray-400">Area Protected</p>
                  </div>
                  <div className="text-center p-3 bg-gray-700 rounded">
                    <Leaf className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                    <p className="text-lg font-bold text-blue-400">{impact.carbonCredits.toFixed(1)} tons</p>
                    <p className="text-xs text-gray-400">CO₂ Sequestered/year</p>
                  </div>
                  <div className="text-center p-3 bg-gray-700 rounded">
                    <Shield className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                    <p className="text-lg font-bold text-purple-400">{Math.round(impact.biodiversity)}</p>
                    <p className="text-xs text-gray-400">Species Supported</p>
                  </div>
                  <div className="text-center p-3 bg-gray-700 rounded">
                    <Users className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                    <p className="text-lg font-bold text-yellow-400">{impact.communityJobs}</p>
                    <p className="text-xs text-gray-400">Local Jobs Created</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={onClose}
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleFunding}
                disabled={!fundingAmountNum || fundingAmountNum > userBalance || !isConnected}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <Wallet className="w-4 h-4 mr-2" />
                Fund ${fundingAmountNum.toLocaleString()} USDC
              </Button>
            </div>
          </div>
        )}

        {step === 'confirmation' && (
          <div className="space-y-6 text-center">
            <div className="space-y-4">
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
                isPending || isConfirming ? 'bg-blue-900' : 'bg-green-900'
              }`}>
                {isPending || isConfirming ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                ) : (
                  <CheckCircle className="w-8 h-8 text-green-400" />
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {isPending ? 'Confirm Transaction' : 
                   isConfirming ? 'Processing...' : 
                   'Transaction Submitted'}
                </h3>
                <p className="text-gray-400 text-sm">
                  {isPending ? 'Please confirm the transaction in your wallet' :
                   isConfirming ? 'Your funding is being processed on the blockchain' :
                   'Your funding transaction has been submitted'}
                </p>
              </div>

              {hash && (
                <div className="bg-gray-800 p-3 rounded border border-gray-700">
                  <p className="text-xs text-gray-400 mb-1">Transaction Hash:</p>
                  <div className="flex items-center justify-center gap-2">
                    <code className="text-xs text-blue-400">{hash.slice(0, 20)}...</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`https://sepolia-optimism.etherscan.io/tx/${hash}`, '_blank')}
                      className="h-6 w-6 p-0"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="space-y-6 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-green-900 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-green-400 mb-2">
                  Funding Successful! 🌱
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Thank you for supporting mangrove restoration! Your contribution will make a real impact.
                </p>
              </div>

              {/* Success Summary */}
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-400">${fundingAmountNum.toLocaleString()}</p>
                      <p className="text-gray-400">Funded</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-400">{impact?.carbonCredits.toFixed(1)}</p>
                      <p className="text-gray-400">CO₂ tons/year</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium text-blue-400">What's Next?</span>
                </div>
                <div className="text-xs text-gray-300 space-y-1">
                  <p>• Monitoring reports will be generated monthly</p>
                  <p>• Carbon credits will be issued after verification</p>
                  <p>• You'll receive impact updates via your dashboard</p>
                </div>
              </div>

              <Button 
                onClick={onClose}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                Continue Exploring
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
