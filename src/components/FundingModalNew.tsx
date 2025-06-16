import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { 
  MapPin, 
  TreePine, 
  DollarSign, 
  Leaf, 
  Shield, 
  TrendingUp,
  Users,
  Target,
  Sparkles
} from "lucide-react";
import { MangroveRegion } from '@/types';
import { StakingModal } from './StakingModal';

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
  const [showStakingModal, setShowStakingModal] = useState(false);
  
  if (!region) return null;

  const handleStakeClick = () => {
    setShowStakingModal(true);
    onClose(); // Close this modal when opening staking modal
  };

  const handleStakingModalClose = () => {
    setShowStakingModal(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
              <TreePine className="h-6 w-6 text-green-400" />
              Fund {region.name}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Region Information */}
            <div className="space-y-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-400" />
                    Region Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Health Status</span>
                    <Badge 
                      className={`${
                        (region.health_index || 0) >= 80 ? 'bg-green-600' :
                        (region.health_index || 0) >= 60 ? 'bg-yellow-600' :
                        'bg-red-600'
                      }`}
                    >
                      {(region.health_index || 0) >= 80 ? 'Excellent' :
                       (region.health_index || 0) >= 60 ? 'Good' : 'Critical'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Protection Coverage</span>
                      <span className="text-gray-300">{Math.round((region.health_index || 70))}%</span>
                    </div>
                    <Progress value={region.health_index || 70} className="h-2" />
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Area</span>
                    <span className="text-white">{region.area_hectares?.toLocaleString() || '1,200'} hectares</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Protection Level</span>
                    <Badge variant={(region.protection_level === 'high') ? 'destructive' : 'outline'}>
                      {region.protection_level || 'Medium'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Conservation Impact */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-400" />
                    Conservation Goals
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <TreePine className="h-4 w-4 text-green-400" />
                    <span className="text-gray-300 text-sm">Restore 500 hectares of mangrove forest</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-blue-400" />
                    <span className="text-gray-300 text-sm">Protect coastal communities from storms</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Leaf className="h-4 w-4 text-yellow-400" />
                    <span className="text-gray-300 text-sm">Sequester 75,000 tons of CO₂ annually</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-purple-400" />
                    <span className="text-gray-300 text-sm">Support 1,200 local families</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Staking Information */}
            <div className="space-y-4">
              <Card className="bg-gradient-to-br from-green-900/30 to-blue-900/30 border-green-700/50">
                <CardHeader>
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-400" />
                    Stake USDC & Earn CC Tokens
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                    <h4 className="text-white font-medium flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-yellow-400" />
                      How It Works
                    </h4>
                    <div className="space-y-2 text-sm text-gray-300">
                      <p>• Stake USDC to fund mangrove conservation</p>
                      <p>• Earn 2.5 CC tokens per USDC per year (fast testing rate)</p>
                      <p>• Higher stakes unlock verification phases</p>
                      <p>• Withdraw your stake anytime</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                      <div className="text-green-400 font-bold text-lg">250%</div>
                      <div className="text-gray-400 text-xs">Annual CC Return</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                      <div className="text-blue-400 font-bold text-lg">2.5%</div>
                      <div className="text-gray-400 text-xs">Platform Fee</div>
                    </div>
                  </div>

                  <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-blue-400" />
                      <span className="text-blue-400 font-medium text-sm">Verification Phases</span>
                    </div>
                    <div className="space-y-1 text-xs text-blue-300">
                      <p>Phase 1: 1-499 USDC staked</p>
                      <p>Phase 2: 500-999 USDC staked</p>
                      <p>Phase 3: 1000+ USDC staked</p>
                    </div>
                  </div>

                  <Button 
                    onClick={handleStakeClick}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium"
                    size="lg"
                  >
                    <TreePine className="w-5 h-5 mr-2" />
                    Stake USDC
                  </Button>
                </CardContent>
              </Card>

              {/* Real-time Impact */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-green-400" />
                    Current Funding
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-gray-300">73%</span>
                    </div>
                    <Progress value={73} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-green-400 font-bold text-lg">$146,000</div>
                      <div className="text-gray-400 text-xs">Raised</div>
                    </div>
                    <div>
                      <div className="text-blue-400 font-bold text-lg">$200,000</div>
                      <div className="text-gray-400 text-xs">Goal</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <StakingModal
        isOpen={showStakingModal}
        onClose={handleStakingModalClose}
        regionId={1} // Default to region 1 for now
        regionName={region.name}
      />
    </>
  );
};
