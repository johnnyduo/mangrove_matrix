
import { useState } from 'react';
import { MapCanvas } from '../components/MapCanvas';
import { StakingPanel } from '../components/StakingPanel';
import { TopNavbar } from '../components/TopNavbar';
import { HealthLegend } from '../components/HealthLegend';
import { DetailDrawer } from '../components/DetailDrawer';
import { MangroveRegion } from '@/types';

const Index = () => {
  const [isStakingPanelOpen, setIsStakingPanelOpen] = useState(false);
  // Campaigns panel state removed
  const [selectedRegion, setSelectedRegion] = useState<MangroveRegion | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleRegionClick = (region: MangroveRegion) => {
    setSelectedRegion(region);
    setIsDrawerOpen(true);
  };

  return (
    <div className="h-screen w-full bg-gray-900 text-white overflow-hidden">
      {/* Top Navigation */}
      <TopNavbar />
      
      {/* Main Content */}
      <div className="relative h-[calc(100vh-64px)] w-full">
        {/* Map Canvas */}
        <MapCanvas 
          onRegionClick={handleRegionClick}
          selectedRegion={selectedRegion}
        />
        
        {/* Campaigns Panel removed */}
        
        {/* Staking Panel - Right Side */}
        <StakingPanel 
          isOpen={isStakingPanelOpen}
          onToggle={() => setIsStakingPanelOpen(!isStakingPanelOpen)}
          selectedRegion={selectedRegion}
        />
        
        {/* Detail Drawer */}
        <DetailDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          region={selectedRegion}
        />
        
        {/* Bottom Legend */}
        <HealthLegend />
      </div>
    </div>
  );
};

export default Index;
