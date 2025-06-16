import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  TreePine, 
  Info, 
  CheckCircle,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { useMangroveStaking } from '@/hooks/use-mangrove-staking';
import { toast } from 'sonner';

interface StakingModalProps {
  isOpen: boolean;
  onClose: () => void;
  regionId?: number;
  regionName?: string;
}

export const StakingModal: React.FC<StakingModalProps> = ({
  isOpen,
  onClose,
  regionId = 1,
  regionName = "Sundarbans, Bangladesh"
}) => {
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<'input' | 'approve' | 'stake' | 'success'>('input');
  
  const {
    stakingData,
    approveUSDC,
    stakeUSDC,
    needsApproval,
    isPending,
    isConfirming,
    isConnected
  } = useMangroveStaking();

  const handleAmountChange = (value: string) => {
    // Only allow numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const calculateFee = (amount: string): string => {
    const numAmount = parseFloat(amount) || 0;
    const feePercent = parseFloat(stakingData.stakingFee) || 2.5;
    return (numAmount * feePercent / 100).toFixed(2);
  };

  const calculateNetStake = (amount: string): string => {
    const numAmount = parseFloat(amount) || 0;
    const fee = parseFloat(calculateFee(amount));
    return (numAmount - fee).toFixed(2);
  };

  const canProceed = (): boolean => {
    const numAmount = parseFloat(amount);
    const balance = parseFloat(stakingData.usdcBalance);
    return numAmount > 0 && numAmount <= balance && isConnected;
  };

  const handleApprove = async () => {
    if (!canProceed()) return;

    setStep('approve');
    const result = await approveUSDC(amount);
    
    if (result.success) {
      toast.success(result.message);
      setStep('stake');
    } else {
      toast.error(result.message);
      setStep('input');
    }
  };

  const handleStake = async () => {
    if (!canProceed()) return;

    const result = await stakeUSDC(regionId, amount);
    
    if (result.success) {
      toast.success(result.message);
      setStep('success');
      setTimeout(() => {
        handleClose();
      }, 2000);
    } else {
      toast.error(result.message);
      setStep('input');
    }
  };

  const handleProceed = async () => {
    if (needsApproval(amount)) {
      await handleApprove();
    } else {
      await handleStake();
    }
  };

  const handleClose = () => {
    setAmount('');
    setStep('input');
    onClose();
  };

  const getStepContent = () => {
    switch (step) {
      case 'input':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount to Stake (USDC)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="amount"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="pl-10 text-lg"
                  disabled={isPending || isConfirming}
                />
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span>Available: {stakingData.usdcBalance} USDC</span>
                <button
                  onClick={() => setAmount(stakingData.usdcBalance)}
                  className="text-blue-400 hover:text-blue-300"
                  disabled={isPending || isConfirming}
                >
                  Max
                </button>
              </div>
            </div>

            {amount && parseFloat(amount) > 0 && (
              <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-medium text-gray-300">Transaction Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Stake Amount:</span>
                    <span className="text-white">{amount} USDC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Platform Fee ({stakingData.stakingFee}%):</span>
                    <span className="text-red-400">-{calculateFee(amount)} USDC</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-600 pt-2">
                    <span className="text-gray-300 font-medium">Net Stake:</span>
                    <span className="text-green-400 font-medium">{calculateNetStake(amount)} USDC</span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-400 space-y-1">
                  <p><strong>How it works:</strong></p>
                  <p>• Your USDC is staked in the selected mangrove region</p>
                  <p>• You earn CC tokens at 2.5 per USDC per year (fast testing rate)</p>
                  <p>• Higher stakes unlock advanced verification phases</p>
                  <p>• You can withdraw your stake anytime</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'approve':
        return (
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-white mb-2">Approve USDC</h3>
              <p className="text-gray-400 text-sm">
                Please approve the spending of {amount} USDC in your wallet
              </p>
            </div>
          </div>
        );

      case 'stake':
        return (
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-green-400 animate-spin" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-white mb-2">Staking USDC</h3>
              <p className="text-gray-400 text-sm">
                Staking {calculateNetStake(amount)} USDC in {regionName}
              </p>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-white mb-2">Stake Successful!</h3>
              <p className="text-gray-400 text-sm">
                Successfully staked {calculateNetStake(amount)} USDC in {regionName}
              </p>
              <p className="text-green-400 text-sm mt-2">
                You will start earning CC tokens immediately
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getActionButton = () => {
    if (!isConnected) {
      return (
        <Button disabled className="w-full">
          <AlertTriangle className="w-4 h-4 mr-2" />
          Connect Wallet First
        </Button>
      );
    }

    if (step === 'success') {
      return (
        <Button onClick={handleClose} className="w-full bg-green-600 hover:bg-green-700">
          <CheckCircle className="w-4 h-4 mr-2" />
          Done
        </Button>
      );
    }

    if (step === 'approve' || step === 'stake') {
      return (
        <Button disabled className="w-full">
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          {step === 'approve' ? 'Awaiting Approval...' : 'Staking...'}
        </Button>
      );
    }

    return (
      <Button 
        onClick={handleProceed}
        disabled={!canProceed() || isPending || isConfirming}
        className="w-full bg-green-600 hover:bg-green-700"
      >
        <TreePine className="w-4 h-4 mr-2" />
        {needsApproval(amount) ? 'Approve & Stake' : 'Stake USDC'}
      </Button>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <TreePine className="h-5 w-5 text-green-400" />
            Stake in {regionName}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Stake USDC to support mangrove conservation and earn CC tokens
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {getStepContent()}

          <div className="flex gap-2 pt-4">
            {step === 'input' && (
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                disabled={isPending || isConfirming}
              >
                Cancel
              </Button>
            )}
            {getActionButton()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
