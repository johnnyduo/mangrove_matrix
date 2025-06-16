// Define types for the application

/**
 * Represents a mangrove region with its properties
 */
export interface MangroveRegion {
  name: string;
  lat?: number;
  lng?: number;
  health?: number;
  flood_protection_m?: number;
  carbon_sequestration_tpy?: number;
  biodiversity_index?: number;
  economic_value_usd?: number;
  area_hectares?: number;
  country?: string;
  protection_level?: string;
  // Add any other properties that might be present in your region data
}