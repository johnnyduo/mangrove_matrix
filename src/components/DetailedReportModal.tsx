import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";
import { 
  TreePine, 
  Waves, 
  DollarSign, 
  Leaf, 
  Shield, 
  TrendingUp,
  MapPin,
  Calendar,
  Users,
  Fish
} from "lucide-react";
import { MangroveRegion } from '@/types';

interface DetailedReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  region: MangroveRegion | null;
}

export const DetailedReportModal: React.FC<DetailedReportModalProps> = ({
  isOpen,
  onClose,
  region
}) => {
  const [additionalData, setAdditionalData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && region) {
      fetchAdditionalData();
    }
  }, [isOpen, region]);

  const fetchAdditionalData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/mock_mangrove_predictions.json');
      if (response.ok) {
        const data = await response.json();
        // Find matching region or use first one as demo
        const matchingRegion = data.features.find((feature: any) => 
          feature.properties.name === region?.name
        ) || data.features[0];
        setAdditionalData(matchingRegion?.properties);
      }
    } catch (error) {
      console.warn('Could not load additional data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!region) return null;

  const healthScore = region.health || region.health_index || 0;
  const protectionLevel = region.protection_level || 'medium';
  const displayData = additionalData || region;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-green-400 flex items-center gap-2">
            <TreePine className="h-6 w-6" />
            {region.name || 'Mangrove Region'} - Detailed Report
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="environmental">Environmental</TabsTrigger>
            <TabsTrigger value="economic">Economic</TabsTrigger>
            <TabsTrigger value="conservation">Conservation</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Information */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-green-400 flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Country:</span>
                    <span className="font-semibold">{region.country || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Area:</span>
                    <span className="font-semibold">
                      {region.area_hectares ? `${region.area_hectares.toLocaleString()} ha` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Protection Level:</span>
                    <Badge variant={protectionLevel === 'high' ? 'default' : 'secondary'}>
                      {protectionLevel.charAt(0).toUpperCase() + protectionLevel.slice(1)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Health Score */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-green-400 flex items-center gap-2">
                    <Leaf className="h-5 w-5" />
                    Health Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Overall Health</span>
                      <span className="font-bold">{Math.round(healthScore * 100)}%</span>
                    </div>
                    <Progress value={healthScore * 100} className="h-3" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Biodiversity Index</span>
                      <span className="font-bold">
                        {displayData.biodiversity_index ? 
                          Math.round(displayData.biodiversity_index * 100) + '%' : 'N/A'}
                      </span>
                    </div>
                    <Progress 
                      value={(displayData.biodiversity_index || 0) * 100} 
                      className="h-3" 
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gray-800 border-gray-700 text-center">
                <CardContent className="pt-6">
                  <Waves className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Flood Protection</p>
                  <p className="text-lg font-bold text-blue-400">
                    {displayData.flood_protection_m ? `${displayData.flood_protection_m.toFixed(1)}m` : 'N/A'}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800 border-gray-700 text-center">
                <CardContent className="pt-6">
                  <TreePine className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Carbon Sequestration</p>
                  <p className="text-lg font-bold text-green-400">
                    {displayData.carbon_sequestration_tpy ? `${displayData.carbon_sequestration_tpy.toFixed(1)} t/yr` : 'N/A'}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800 border-gray-700 text-center">
                <CardContent className="pt-6">
                  <DollarSign className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Economic Value</p>
                  <p className="text-lg font-bold text-yellow-400">
                    {displayData.economic_value_usdpy || displayData.economic_value_usd ? 
                      `$${((displayData.economic_value_usdpy || displayData.economic_value_usd) / 1000).toFixed(0)}k/yr` : 'N/A'}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800 border-gray-700 text-center">
                <CardContent className="pt-6">
                  <Shield className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Conservation Status</p>
                  <p className="text-lg font-bold text-purple-400">
                    {protectionLevel === 'high' ? 'Protected' : 'At Risk'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="environmental" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-green-400">Ecosystem Services</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Carbon Storage Capacity</span>
                      <span className="font-semibold">High</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Water Filtration</span>
                      <span className="font-semibold">Excellent</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Coastal Protection</span>
                      <span className="font-semibold">Critical</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Nursery Habitat</span>
                      <span className="font-semibold">Essential</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-blue-400">Climate Impact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Sea Level Rise Buffer</span>
                      <span className="font-semibold">
                        {displayData.flood_protection_m ? `${displayData.flood_protection_m.toFixed(1)}m` : '2.5m'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Storm Surge Reduction</span>
                      <span className="font-semibold">70%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Temperature Regulation</span>
                      <span className="font-semibold">Moderate</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Salinity Control</span>
                      <span className="font-semibold">Active</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center gap-2">
                  <Fish className="h-5 w-5" />
                  Biodiversity Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-400">250+</p>
                    <p className="text-sm text-gray-400">Fish Species</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-400">180+</p>
                    <p className="text-sm text-gray-400">Bird Species</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-400">95+</p>
                    <p className="text-sm text-gray-400">Plant Species</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="economic" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-yellow-400">Economic Benefits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Tourism Revenue</span>
                      <span className="font-semibold">
                        ${(displayData.economic_value_usdpy || displayData.economic_value_usd) ? 
                          Math.round((displayData.economic_value_usdpy || displayData.economic_value_usd) * 0.3).toLocaleString() : '75,000'}/yr
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fisheries Value</span>
                      <span className="font-semibold">
                        ${(displayData.economic_value_usdpy || displayData.economic_value_usd) ? 
                          Math.round((displayData.economic_value_usdpy || displayData.economic_value_usd) * 0.4).toLocaleString() : '100,000'}/yr
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Carbon Credits</span>
                      <span className="font-semibold">
                        ${displayData.carbon_sequestration_tpy ? 
                          Math.round(displayData.carbon_sequestration_tpy * 50).toLocaleString() : '1,500'}/yr
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Coastal Protection Value</span>
                      <span className="font-semibold">
                        ${(displayData.economic_value_usdpy || displayData.economic_value_usd) ? 
                          Math.round((displayData.economic_value_usdpy || displayData.economic_value_usd) * 0.3).toLocaleString() : '60,000'}/yr
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-green-400">Investment Opportunities</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-700 rounded">
                      <p className="font-semibold text-green-400">Restoration Project</p>
                      <p className="text-sm text-gray-400">5-year ROI: 340%</p>
                      <p className="text-sm">Expected yield: $25,000/yr</p>
                    </div>
                    <div className="p-3 bg-gray-700 rounded">
                      <p className="font-semibold text-blue-400">Monitoring System</p>
                      <p className="text-sm text-gray-400">3-year ROI: 180%</p>
                      <p className="text-sm">Data collection & analysis</p>
                    </div>
                    <div className="p-3 bg-gray-700 rounded">
                      <p className="font-semibold text-yellow-400">Community Program</p>
                      <p className="text-sm text-gray-400">Long-term ROI: 250%</p>
                      <p className="text-sm">Sustainable livelihoods</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="conservation" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-purple-400">Current Threats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { threat: 'Coastal Development', severity: 'High', color: 'text-red-400' },
                      { threat: 'Climate Change', severity: 'Medium', color: 'text-yellow-400' },
                      { threat: 'Pollution', severity: 'Medium', color: 'text-yellow-400' },
                      { threat: 'Overfishing', severity: 'Low', color: 'text-green-400' }
                    ].map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span>{item.threat}</span>
                        <Badge className={item.color}>{item.severity}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-green-400">Conservation Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { action: 'Replanting Program', status: 'Active', progress: 75 },
                      { action: 'Water Quality Monitoring', status: 'Active', progress: 90 },
                      { action: 'Community Education', status: 'Planned', progress: 25 },
                      { action: 'Research Station', status: 'Planned', progress: 10 }
                    ].map((item, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm">{item.action}</span>
                          <span className="text-xs text-gray-400">{item.progress}%</span>
                        </div>
                        <Progress value={item.progress} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-blue-400 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Community Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-green-400">1,200</p>
                    <p className="text-sm text-gray-400">Local Beneficiaries</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-400">45</p>
                    <p className="text-sm text-gray-400">Jobs Created</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-400">8</p>
                    <p className="text-sm text-gray-400">Partner Organizations</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
