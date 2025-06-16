import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Coins, 
  TrendingUp, 
  Leaf, 
  MapPin, 
  Clock, 
  Users, 
  Target,
  Wallet,
  Plus,
  RefreshCw,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Info
} from 'lucide-react';
import { useAccount } from 'wagmi';
import { useContracts } from '@/hooks/useContracts';
import { Campaign } from '@/lib/contractService';
import { formatUSDC } from '@/lib/contracts';
import { createDemoCampaigns } from '@/lib/demoData';

interface CampaignsPanelProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const CampaignsPanel = ({ isOpen, onToggle }: CampaignsPanelProps) => {
  const { address, isConnected } = useAccount();
  const {
    contractService,
    isInitialized,
    isLoading,
    usdcBalance,
    userStats,
    campaigns,
    // createCampaign removed
    contributeToCampaign,
    releaseFunds,
    refundContribution,
    refreshData,
    mintTestUSDC,
  } = useContracts();

  // Form states
  const [contributeAmount, setContributeAmount] = useState('');
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  // Campaign creation states removed

  const handleSetupDemo = async () => {
    if (!contractService) return;
    
    try {
      await createDemoCampaigns(contractService);
      await refreshData();
    } catch (error) {
      console.error('Demo setup failed:', error);
    }
  };

  const handleContribute = async () => {
    if (!contributeAmount || !selectedCampaignId || parseFloat(contributeAmount) <= 0) return;
    
    try {
      await contributeToCampaign(selectedCampaignId, contributeAmount);
      setContributeAmount('');
      setSelectedCampaignId(null);
    } catch (error) {
      console.error('Contribution failed:', error);
    }
  };

  // Campaign creation function removed

  const handleMintUSDC = async () => {
    try {
      await mintTestUSDC('1000'); // Mint 1000 USDC for testing
    } catch (error) {
      console.error('Minting failed:', error);
    }
  };

  const getCampaignProgress = (campaign: Campaign) => {
    const progress = Number(campaign.raisedAmount) / Number(campaign.targetAmount) * 100;
    return Math.min(progress, 100);
  };

  const isDeadlinePassed = (deadline: number) => {
    return Date.now() / 1000 > deadline;
  };

  const getDaysLeft = (deadline: number) => {
    const secondsLeft = deadline - Date.now() / 1000;
    return Math.max(0, Math.ceil(secondsLeft / 86400));
  };

  return (
    <>
      {/* Toggle Button */}
      <Button
        onClick={onToggle}
        className="fixed left-4 top-1/2 transform -translate-y-1/2 z-40 bg-green-600 hover:bg-green-700 rounded-r-lg rounded-l-none shadow-lg"
        size="sm"
      >
        <Leaf className="w-4 h-4 mr-2" />
        {isOpen ? '←' : 'Campaigns'}
      </Button>

      {/* Panel */}
      <div className={`fixed left-0 top-16 h-[calc(100vh-64px)] w-96 bg-gray-900/95 backdrop-blur-sm border-r border-gray-800 transition-transform duration-300 ease-in-out z-30 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 space-y-6 h-full overflow-y-auto">
          
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Leaf className="w-6 h-6 text-green-400" />
              <h2 className="text-xl font-bold">MangroveMatrix</h2>
            </div>
            <p className="text-sm text-gray-400">Fund mangrove restoration campaigns</p>
          </div>

          {/* Connection Status */}
          {!isConnected && (
            <Card className="bg-red-900/20 border-red-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <span className="text-red-400">Please connect your wallet</span>
                </div>
              </CardContent>
            </Card>
          )}

          {isConnected && !isInitialized && (
            <Card className="bg-yellow-900/20 border-yellow-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-yellow-400" />
                  <span className="text-yellow-400">Initializing contracts...</span>
                </div>
              </CardContent>
            </Card>
          )}

          {isConnected && isInitialized && (
            <>
              {/* Wallet Info */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Wallet className="w-5 h-5" />
                    Wallet
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">USDC Balance:</span>
                    <span className="font-mono text-green-400">${usdcBalance}</span>
                  </div>
                  
                  {userStats && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Total Contributed:</span>
                        <span className="font-mono">${formatUSDC(userStats.totalContributed)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Carbon Credits:</span>
                        <span className="font-mono text-green-400">{formatUSDC(userStats.carbonCredits)}</span>
                      </div>
                    </>
                  )}
                  
                  <Separator />
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={refreshData} 
                      size="sm" 
                      variant="outline"
                      disabled={isLoading}
                      className="flex-1"
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                    <Button 
                      onClick={handleMintUSDC} 
                      size="sm" 
                      variant="outline"
                      disabled={isLoading}
                      className="flex-1"
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      Mint USDC
                    </Button>
                  </div>
                  
                  {campaigns.length === 0 && (
                    <Button 
                      onClick={handleSetupDemo} 
                      size="sm" 
                      variant="default"
                      disabled={isLoading}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <Leaf className="w-4 h-4 mr-2" />
                      Setup Demo Campaigns
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Campaigns Tabs */}
              <Tabs defaultValue="browse" className="space-y-4">
                <TabsList className="grid w-full grid-cols-1">
                  <TabsTrigger value="browse">Browse Campaigns</TabsTrigger>
                </TabsList>

                {/* Browse Campaigns */}
                <TabsContent value="browse" className="space-y-4">
                  {campaigns.length === 0 ? (
                    <Card className="bg-gray-800/50 border-gray-700">
                      <CardContent className="p-6 text-center">
                        <Leaf className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">No campaigns found</p>
                        <p className="text-sm text-gray-500 mt-2">Check back later for available campaigns.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    campaigns.map((campaign) => (
                      <Card key={campaign.id} className="bg-gray-800/50 border-gray-700">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-base">{campaign.name}</CardTitle>
                              <div className="flex items-center gap-1 text-sm text-gray-400">
                                <MapPin className="w-3 h-3" />
                                {campaign.location}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <Badge variant={campaign.isActive ? "default" : "secondary"}>
                                {campaign.isActive ? "Active" : "Inactive"}
                              </Badge>
                              {campaign.fundsReleased && (
                                <Badge variant="outline" className="text-green-400 border-green-400">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Completed
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-gray-400">Progress</span>
                              <span className="text-sm font-mono">
                                ${formatUSDC(campaign.raisedAmount)} / ${formatUSDC(campaign.targetAmount)}
                              </span>
                            </div>
                            <Progress value={getCampaignProgress(campaign)} className="h-2" />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="text-gray-400">Days Left</div>
                              <div className="font-mono">{getDaysLeft(campaign.deadline)}</div>
                            </div>
                            <div>
                              <div className="text-gray-400">Carbon Credits</div>
                              <div className="font-mono text-green-400">{campaign.carbonCreditsExpected}</div>
                            </div>
                          </div>

                          {campaign.isActive && !campaign.fundsReleased && !isDeadlinePassed(campaign.deadline) && (
                            <div className="space-y-2">
                              <div className="flex gap-2">
                                <Input
                                  type="number"
                                  placeholder="Amount"
                                  value={selectedCampaignId === campaign.id ? contributeAmount : ''}
                                  onChange={(e) => {
                                    setSelectedCampaignId(campaign.id);
                                    setContributeAmount(e.target.value);
                                  }}
                                  className="flex-1"
                                />
                                <Button
                                  onClick={handleContribute}
                                  disabled={isLoading || !contributeAmount || selectedCampaignId !== campaign.id}
                                  size="sm"
                                >
                                  <Coins className="w-4 h-4 mr-2" />
                                  Fund
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Campaign Actions for Owner */}
                          {campaign.beneficiary?.toLowerCase() === address?.toLowerCase() && (
                            <div className="flex gap-2">
                              {!campaign.fundsReleased && getCampaignProgress(campaign) >= 100 && (
                                <Button
                                  onClick={() => releaseFunds(campaign.id)}
                                  disabled={isLoading}
                                  size="sm"
                                  variant="outline"
                                >
                                  Release Funds
                                </Button>
                              )}
                              {!campaign.fundsReleased && isDeadlinePassed(campaign.deadline) && getCampaignProgress(campaign) < 100 && (
                                <Button
                                  onClick={() => refundContribution(campaign.id)}
                                  disabled={isLoading}
                                  size="sm"
                                  variant="outline"
                                >
                                  Enable Refunds
                                </Button>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>

                {/* Create Campaign tab removed */}
              </Tabs>
            </>
          )}
        </div>
      </div>
    </>
  );
};
