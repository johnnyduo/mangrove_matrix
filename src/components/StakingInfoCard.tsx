import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Coins, 
  TrendingUp, 
  TreePine, 
  CheckCircle, 
  Clock,
  Gift
} from 'lucide-react';
import { useCarbonCredit } from '@/hooks/use-carbon-credit';
import { toast } from 'sonner';

export const StakingInfoCard = () => {
  const {
    stakingInfo,
    ccBalance,
    totalCCEarned,
    verificationPhaseText,
    claimRewards,
    canClaimRewards,
    isClaimPending,
    isClaimConfirming,
    isConnected
  } = useCarbonCredit();

  const handleClaimRewards = async () => {
    const result = await claimRewards();
    
    if (result.success) {
      toast.success(result.message, {
        description: result.txHash ? `Transaction: ${result.txHash.slice(0, 10)}...` : undefined,
      });
    } else {
      toast.error(result.message);
    }
  };

  if (!isConnected) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="pt-6 text-center">
          <p className="text-gray-400">Connect your wallet to view staking information</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-green-400 flex items-center gap-2">
          <Coins className="h-5 w-5" />
          Your Stakes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Staked Amount */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-400" />
            <span className="text-gray-400 text-sm">Staked</span>
          </div>
          <span className="text-white font-semibold">
            {parseFloat(stakingInfo.stakedAmount).toLocaleString()} USDC
          </span>
        </div>

        {/* CC Tokens Earned */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-green-400" />
            <span className="text-gray-400 text-sm">CC Tokens Earned</span>
          </div>
          <div className="text-right">
            <div className="text-green-400 font-semibold">
              +{totalCCEarned} CC
            </div>
            {parseFloat(stakingInfo.pendingRewards) > 0 && (
              <div className="text-xs text-yellow-400">
                {parseFloat(stakingInfo.pendingRewards).toFixed(2)} pending
              </div>
            )}
          </div>
        </div>

        {/* Hectares Supported */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <TreePine className="h-4 w-4 text-green-500" />
            <span className="text-gray-400 text-sm">Hectares Supported</span>
          </div>
          <span className="text-white font-semibold">
            {stakingInfo.hectaresSupported}
          </span>
        </div>

        {/* Verification Phase */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-purple-400" />
            <span className="text-gray-400 text-sm">Verification Phase</span>
          </div>
          <Badge variant="outline" className="text-purple-400 border-purple-400">
            {verificationPhaseText}
          </Badge>
        </div>

        {/* Progress Bar for Verification */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Verification Progress</span>
            <span className="text-gray-400">{stakingInfo.verificationPhase}/3</span>
          </div>
          <Progress 
            value={(stakingInfo.verificationPhase / 3) * 100} 
            className="h-2" 
          />
        </div>

        {/* Current CC Balance */}
        <div className="bg-gray-700/50 rounded-lg p-3 border border-gray-600/50">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400 text-sm">Current CC Balance</span>
            <span className="text-green-400 font-bold">{ccBalance} CC</span>
          </div>
          
          {/* Claim Rewards Button */}
          {canClaimRewards && (
            <Button
              onClick={handleClaimRewards}
              disabled={isClaimPending || isClaimConfirming}
              size="sm"
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {isClaimPending || isClaimConfirming ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  {isClaimPending ? 'Claiming...' : 'Confirming...'}
                </>
              ) : (
                <>
                  <Gift className="w-4 h-4 mr-2" />
                  Claim {parseFloat(stakingInfo.pendingRewards).toFixed(2)} CC
                </>
              )}
            </Button>
          )}
          
          {!canClaimRewards && parseFloat(stakingInfo.stakedAmount) > 0 && (
            <div className="flex items-center justify-center gap-2 text-gray-400 text-sm py-2">
              <Clock className="w-4 h-4" />
              <span>Rewards accumulating...</span>
            </div>
          )}
        </div>

        {/* Info about earning rate */}
        {parseFloat(stakingInfo.stakedAmount) > 0 && (
          <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-3">
            <div className="text-xs text-blue-400 space-y-1">
              <p className="font-medium">💡 Earning Rate</p>
              <p>• 0.025 CC tokens per USDC per year</p>
              <p>• Rewards calculated in real-time</p>
              <p>• Higher stakes unlock verification phases</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
