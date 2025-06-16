import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, MapPin, Activity, Shield, Waves } from 'lucide-react';
import { MangroveRegion } from '@/types';
import { DetailedReportModal } from './DetailedReportModal';
import { FundingModal } from './FundingModal';

interface DetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  region: MangroveRegion | null;
}

export const DetailDrawer = ({ isOpen, onClose, region }: DetailDrawerProps) => {
  const [isReportModalOpen, setReportModalOpen] = useState(false);
  const [isFundingModalOpen, setFundingModalOpen] = useState(false);

  if (!isOpen || !region) return null;

  return (
    <div className={`fixed left-0 top-16 h-[calc(100vh-64px)] w-72 bg-gray-900/95 backdrop-blur-sm border-r border-gray-800 transition-transform duration-300 ease-in-out z-30 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <div className="p-4 space-y-4 h-full overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Region Details</h3>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Region Info */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-blue-400" />
              {region.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Mangrove Health Index</span>
              <Badge className={`$
                {region.health && region.health > 0.8 ? 'bg-green-600' : 
                region.health && region.health > 0.6 ? 'bg-yellow-600' : 'bg-red-600'
              } text-white`}>
                {typeof region.health === 'number' ? region.health.toFixed(2) : 'N/A'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Coordinates</span>
              <span className="text-white text-sm">
                {typeof region.lat === 'number' && typeof region.lng === 'number' ? `${region.lat.toFixed(2)}°, ${region.lng.toFixed(2)}°` : 'N/A'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* AI Predictions */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base flex items-center">
              <Activity className="w-4 h-4 mr-2 text-purple-400" />
              AI Predictions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span className="text-gray-400 text-sm">Flood Protection</span>
              </div>
              <span className="text-white font-semibold">
                {region.flood_protection_m ? `${region.flood_protection_m}m` : 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Waves className="w-4 h-4 text-green-400" />
                <span className="text-gray-400 text-sm">Carbon Sequestration</span>
              </div>
              <span className="text-white font-semibold">
                {region.carbon_sequestration_tpy ? `${region.carbon_sequestration_tpy}t/yr` : 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-yellow-400" />
                <span className="text-gray-400 text-sm">Biodiversity Index</span>
              </div>
              <span className="text-white font-semibold">
                {region.biodiversity_index ? region.biodiversity_index : 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-gray-400 text-sm">Economic Value</span>
              </div>
              <span className="text-green-400 font-semibold">
                {region.economic_value_usd ? `$${region.economic_value_usd.toLocaleString()}/yr` : 'N/A'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button 
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            onClick={() => setFundingModalOpen(true)}
          >
            Fund This Area
          </Button>
          <Button 
            variant="outline" 
            className="w-full border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
            onClick={() => setReportModalOpen(true)}
          >
            View Detailed Report
          </Button>
        </div>
      </div>

      {/* Funding Modal */}
      <FundingModal 
        isOpen={isFundingModalOpen} 
        onClose={() => setFundingModalOpen(false)} 
        region={region} 
      />

      {/* Detailed Report Modal */}
      <DetailedReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setReportModalOpen(false)} 
        region={region} 
      />
    </div>
  );
};
