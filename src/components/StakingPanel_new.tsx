import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronRight, ChevronLeft, Coins, TrendingUp, Leaf, MapPin, AlertCircle, Activity, Droplets, TreePine } from 'lucide-react';
import { useAccount } from 'wagmi';
import { MangroveRegion } from '@/types';
import { useContracts } from '@/hooks/useContracts';

interface StakingPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  selectedRegion: MangroveRegion | null;
}

export const StakingPanel = ({ isOpen, onToggle, selectedRegion }: StakingPanelProps) => {
  const { address, isConnected } = useAccount();
  const { campaigns, contributeToCampaign, isLoading } = useContracts();
  const [quickFundAmount, setQuickFundAmount] = useState('');

  // Find campaigns related to the selected region
  const relatedCampaigns = campaigns.filter(campaign => 
    selectedRegion && campaign.location.toLowerCase().includes(
      selectedRegion.country?.toLowerCase() || selectedRegion.name?.toLowerCase() || ''
    )
  );

  const handleQuickFund = async (campaignId: number) => {
    if (!quickFundAmount || parseFloat(quickFundAmount) <= 0) return;
    
    try {
      await contributeToCampaign(campaignId, quickFundAmount);
      setQuickFundAmount('');
    } catch (error) {
      console.error('Quick funding failed:', error);
    }
  };

  const getHealthColor = (health?: number) => {
    if (!health) return 'text-gray-400';
    if (health >= 80) return 'text-green-400';
    if (health >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getHealthBadge = (health?: number) => {
    if (!health) return { label: 'Unknown', variant: 'secondary' as const };
    if (health >= 80) return { label: 'Excellent', variant: 'default' as const };
    if (health >= 60) return { label: 'Good', variant: 'secondary' as const };
    if (health >= 40) return { label: 'Fair', variant: 'destructive' as const };
    return { label: 'Critical', variant: 'destructive' as const };
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
          
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Activity className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-bold">Region Analysis</h2>
            </div>
            <p className="text-sm text-gray-400">Environmental data and funding opportunities</p>
          </div>

          {/* Region Information */}
          {selectedRegion ? (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-400" />
                  {selectedRegion.name || 'Selected Region'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400">Location</div>
                    <div className="font-mono">
                      {selectedRegion.lat?.toFixed(2)}°, {selectedRegion.lng?.toFixed(2)}°
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">Country</div>
                    <div>{selectedRegion.country || 'Unknown'}</div>
                  </div>
                </div>

                {selectedRegion.health && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400">Ecosystem Health</span>
                      <Badge {...getHealthBadge(selectedRegion.health)}>
                        {getHealthBadge(selectedRegion.health).label}
                      </Badge>
                    </div>
                    <Progress value={selectedRegion.health} className="h-2" />
                    <div className={`text-right text-sm mt-1 ${getHealthColor(selectedRegion.health)}`}>
                      {selectedRegion.health}%
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3 text-sm">
                  {selectedRegion.area_hectares && (
                    <div className="flex justify-between">
                      <span className="text-gray-400 flex items-center gap-1">
                        <TreePine className="w-3 h-3" />
                        Area
                      </span>
                      <span className="font-mono">{selectedRegion.area_hectares.toLocaleString()} ha</span>
                    </div>
                  )}
                  
                  {selectedRegion.carbon_sequestration_tpy && (
                    <div className="flex justify-between">
                      <span className="text-gray-400 flex items-center gap-1">
                        <Leaf className="w-3 h-3" />
                        Carbon/Year
                      </span>
                      <span className="font-mono text-green-400">{selectedRegion.carbon_sequestration_tpy.toLocaleString()} t</span>
                    </div>
                  )}
                  
                  {selectedRegion.flood_protection_m && (
                    <div className="flex justify-between">
                      <span className="text-gray-400 flex items-center gap-1">
                        <Droplets className="w-3 h-3" />
                        Flood Protection
                      </span>
                      <span className="font-mono text-blue-400">{selectedRegion.flood_protection_m}m</span>
                    </div>
                  )}
                  
                  {selectedRegion.biodiversity_index && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Biodiversity Index</span>
                      <span className="font-mono">{selectedRegion.biodiversity_index.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6 text-center">
                <MapPin className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Click on a region in the map to view environmental data and funding opportunities</p>
              </CardContent>
            </Card>
          )}

          {/* Related Campaigns */}
          {selectedRegion && relatedCampaigns.length > 0 && (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Coins className="w-5 h-5 text-green-400" />
                  Active Campaigns
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {relatedCampaigns.slice(0, 2).map((campaign) => (
                  <div key={campaign.id} className="p-3 bg-gray-700/50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-sm">{campaign.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(Number(campaign.raisedAmount) / Number(campaign.targetAmount) * 100)}%
                      </Badge>
                    </div>
                    <Progress 
                      value={Number(campaign.raisedAmount) / Number(campaign.targetAmount) * 100} 
                      className="h-1 mb-2" 
                    />
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={quickFundAmount}
                        onChange={(e) => setQuickFundAmount(e.target.value)}
                        className="flex-1 text-xs h-8"
                      />
                      <Button
                        onClick={() => handleQuickFund(campaign.id)}
                        disabled={isLoading || !quickFundAmount}
                        size="sm"
                        className="h-8 px-3"
                      >
                        Fund
                      </Button>
                    </div>
                  </div>
                ))}
                {relatedCampaigns.length > 2 && (
                  <p className="text-xs text-gray-400 text-center">
                    +{relatedCampaigns.length - 2} more campaigns available
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Impact Potential */}
          {selectedRegion && (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  Impact Potential
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Restoration Priority</span>
                    <span className={`font-medium ${
                      (selectedRegion.health || 0) < 60 ? 'text-red-400' : 
                      (selectedRegion.health || 0) < 80 ? 'text-yellow-400' : 'text-green-400'
                    }`}>
                      {(selectedRegion.health || 0) < 60 ? 'High' : 
                       (selectedRegion.health || 0) < 80 ? 'Medium' : 'Low'}
                    </span>
                  </div>
                  
                  {selectedRegion.economic_value_usd && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Economic Value</span>
                      <span className="font-mono text-green-400">
                        ${selectedRegion.economic_value_usd.toLocaleString()}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Protection Level</span>
                    <span className="text-blue-400">{selectedRegion.protection_level || 'Unprotected'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Connection Status */}
          {!isConnected && (
            <Card className="bg-yellow-900/20 border-yellow-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                  <span className="text-yellow-400 text-sm">Connect wallet to fund campaigns</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};
