// Demo data setup for MangroveMatrix
// This file contains sample campaigns and data for demonstration purposes

export const DEMO_CAMPAIGNS = [
  {
    name: "Costa Rica Pacific Restoration",
    location: "Guanacaste Province, Costa Rica",
    targetAmount: "50000",
    durationDays: 60,
    carbonCredits: 2500,
    description: "Restore 100 hectares of mangrove forest along Costa Rica's Pacific coast, protecting coastal communities from storm surge and providing habitat for endangered species."
  },
  {
    name: "Philippines Mangrove Recovery",
    location: "Palawan, Philippines", 
    targetAmount: "75000",
    durationDays: 90,
    carbonCredits: 3750,
    description: "Community-led restoration of mangrove ecosystems destroyed by recent typhoons, including seedling nurseries and local employment programs."
  },
  {
    name: "Florida Everglades Protection",
    location: "South Florida, USA",
    targetAmount: "25000", 
    durationDays: 45,
    carbonCredits: 1200,
    description: "Protect and restore critical mangrove habitats in the Florida Everglades, supporting biodiversity and carbon sequestration."
  },
  {
    name: "Madagascar Coastal Defense",
    location: "Southwest Madagascar",
    targetAmount: "40000",
    durationDays: 75,
    carbonCredits: 2000,
    description: "Establish mangrove buffer zones to protect coastal villages from rising sea levels and provide sustainable livelihoods for local communities."
  }
];

export const DEMO_IMPACT_STATS = {
  totalFundsRaised: "1,245,000",
  campaignsCompleted: 23,
  hectaresRestored: 450,
  carbonCreditsIssued: 15600,
  communitiesImpacted: 12,
  speciesProtected: 34
};

export const MANGROVE_REGIONS_SAMPLE = [
  {
    name: "Costa Rica Pacific",
    lat: 10.2,
    lng: -85.8,
    health: 85,
    carbon_sequestration_tpy: 1200,
    biodiversity_index: 0.8,
    flood_protection_m: 2.5,
    area_hectares: 850,
    country: "Costa Rica",
    protection_level: "National Park"
  },
  {
    name: "Florida Everglades", 
    lat: 25.3,
    lng: -80.9,
    health: 72,
    carbon_sequestration_tpy: 950,
    biodiversity_index: 0.9,
    flood_protection_m: 1.8,
    area_hectares: 1200,
    country: "USA",
    protection_level: "National Park"
  },
  {
    name: "Palawan Mangroves",
    lat: 9.8,
    lng: 118.7, 
    health: 65,
    carbon_sequestration_tpy: 800,
    biodiversity_index: 0.85,
    flood_protection_m: 2.2,
    area_hectares: 650,
    country: "Philippines", 
    protection_level: "Marine Protected Area"
  },
  {
    name: "Madagascar Southwest",
    lat: -23.4,
    lng: 43.8,
    health: 58,
    carbon_sequestration_tpy: 600,
    biodiversity_index: 0.7,
    flood_protection_m: 1.5,
    area_hectares: 400,
    country: "Madagascar",
    protection_level: "Community Managed"
  }
];

// Helper function to create demo campaigns on the blockchain
export const createDemoCampaigns = async (contractService: any) => {
  console.log("Creating demo campaigns...");
  
  for (const campaign of DEMO_CAMPAIGNS) {
    try {
      await contractService.createCampaign(
        campaign.name,
        campaign.location,
        campaign.targetAmount,
        campaign.durationDays,
        campaign.carbonCredits
      );
      console.log(`Created campaign: ${campaign.name}`);
      
      // Wait a bit between campaigns to avoid nonce issues
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`Failed to create campaign ${campaign.name}:`, error);
    }
  }
};
