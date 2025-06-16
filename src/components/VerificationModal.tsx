
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Upload, Camera, FileText, MapPin, DollarSign, TreePine, Calendar, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: any;
}

export const VerificationModal = ({ isOpen, onClose, location }: VerificationModalProps) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'verification' | 'funding'>('overview');

  if (!isOpen || !location) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending_verification': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'under_review': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'verified': return 'Verified';
      case 'pending_verification': return 'Pending Verification';
      case 'under_review': return 'Under Review';
      default: return 'Unknown';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700 text-white">
        <CardHeader className="border-b border-gray-700">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-blue-400" />
              {location.name} - Verification Report
            </CardTitle>
            <Button onClick={onClose} variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex space-x-4 mt-4">
            {[
              { id: 'overview', label: 'Overview', icon: FileText },
              { id: 'verification', label: 'Verification', icon: Camera },
              { id: 'funding', label: 'Funding', icon: DollarSign }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Status and Location Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center">
                      {getStatusIcon(location.status)}
                      <span className="ml-2">Status Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Current Status</span>
                      <Badge className={`${
                        location.status === 'verified' ? 'bg-green-600' :
                        location.status === 'pending_verification' ? 'bg-yellow-600' : 'bg-red-600'
                      } text-white`}>
                        {getStatusText(location.status)}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Last Verification</span>
                      <span className="text-white">{location.last_verification}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Coordinate Precision</span>
                      <Badge variant={location.coordinates_precision === 'high' ? 'default' : 'secondary'}>
                        {location.coordinates_precision}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Verification Photos</span>
                      <span className="text-white">{location.verification_photos} photos</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center">
                      <MapPin className="w-4 h-4 text-blue-400" />
                      <span className="ml-2">Location Details</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Country</span>
                      <span className="text-white">{location.country}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Area</span>
                      <span className="text-white">{location.area_hectares.toLocaleString()} hectares</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Coordinates</span>
                      <span className="text-white text-sm">
                        {location.lat.toFixed(6)}°, {location.lng.toFixed(6)}°
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Health Index</span>
                      <span className={`font-semibold ${
                        location.health > 0.8 ? 'text-green-400' :
                        location.health > 0.6 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {location.health.toFixed(2)} / 1.00
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Progress Metrics */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <TreePine className="w-4 h-4 text-green-400" />
                    <span className="ml-2">Conservation Progress</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-green-400">
                        {location.planted_trees.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-400">Trees Planted</div>
                    </div>
                    <div className="text-center p-4 bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-blue-400">
                        ${location.funded_amount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-400">Total Funding</div>
                    </div>
                    <div className="text-center p-4 bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-purple-400">
                        {Math.round(location.health * 100)}%
                      </div>
                      <div className="text-sm text-gray-400">Health Score</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Verification Tab */}
          {activeTab === 'verification' && (
            <div className="space-y-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <Camera className="w-4 h-4 text-blue-400" />
                    <span className="ml-2">Upload Verification Evidence</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400 mb-2">Upload satellite images, drone footage, or ground photos</p>
                    <p className="text-xs text-gray-500">Accepted formats: JPG, PNG, MP4, GeoTIFF</p>
                    <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                      Choose Files
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Array.from({ length: location.verification_photos }, (_, i) => (
                      <div key={i} className="aspect-square bg-gray-700 rounded-lg flex items-center justify-center">
                        <Camera className="w-8 h-8 text-gray-400" />
                        <span className="text-xs text-gray-400 ml-2">Photo {i + 1}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-base">Verification Checklist</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { item: 'GPS coordinates verified', completed: true },
                      { item: 'Satellite imagery analyzed', completed: true },
                      { item: 'Ground truth photos uploaded', completed: location.verification_photos > 5 },
                      { item: 'Species identification confirmed', completed: location.status === 'verified' },
                      { item: 'Carbon sequestration calculated', completed: location.status === 'verified' },
                      { item: 'Biodiversity assessment complete', completed: false }
                    ].map((check, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          check.completed ? 'bg-green-600' : 'bg-gray-600'
                        }`}>
                          {check.completed && <CheckCircle className="w-3 h-3 text-white" />}
                        </div>
                        <span className={check.completed ? 'text-white' : 'text-gray-400'}>
                          {check.item}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Funding Tab */}
          {activeTab === 'funding' && (
            <div className="space-y-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    <span className="ml-2">Funding Overview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Funding Sources</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Carbon Credits</span>
                          <span className="text-green-400">${(location.funded_amount * 0.4).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Staking Rewards</span>
                          <span className="text-green-400">${(location.funded_amount * 0.35).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Direct Donations</span>
                          <span className="text-green-400">${(location.funded_amount * 0.25).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Impact Metrics</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">CO₂ Sequestered</span>
                          <span className="text-blue-400">{(location.planted_trees * 0.05).toFixed(1)} tons/year</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Biodiversity Score</span>
                          <span className="text-purple-400">{location.health.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Coastal Protection</span>
                          <span className="text-yellow-400">{(location.area_hectares * 0.01).toFixed(1)} km</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex space-x-4">
                <Button className="flex-1 bg-green-600 hover:bg-green-700">
                  Fund This Project
                </Button>
                <Button variant="outline" className="flex-1 border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white">
                  Generate Impact Report
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
