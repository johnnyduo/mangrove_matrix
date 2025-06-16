// Professional GMW data processor for MangroveMatrix
// Processes real GMW v3 2020 data and adds country information based on coordinates

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Maximum number of features to include (reduced for deployment efficiency)
const MAX_FEATURES = 10000;

// Country detection based on coordinate ranges (simplified but accurate for most cases)
const COUNTRY_REGIONS = {
  // Southeast Asia
  'Indonesia': { lat: [-11, 6], lng: [95, 141] },
  'Malaysia': { lat: [1, 7], lng: [100, 119] },
  'Philippines': { lat: [5, 19], lng: [117, 127] },
  'Thailand': { lat: [6, 20], lng: [97, 106] },
  'Vietnam': { lat: [8, 24], lng: [102, 110] },
  'Myanmar': { lat: [10, 28], lng: [92, 101] },
  'Cambodia': { lat: [10, 15], lng: [103, 108] },
  
  // Americas
  'Brazil': { lat: [-34, 5], lng: [-74, -35] },
  'Mexico': { lat: [14, 33], lng: [-118, -86] },
  'Cuba': { lat: [20, 24], lng: [-85, -74] },
  'Colombia': { lat: [-4, 12], lng: [-79, -67] },
  'Venezuela': { lat: [1, 12], lng: [-73, -60] },
  'Ecuador': { lat: [-5, 2], lng: [-81, -75] },
  'Peru': { lat: [-18, 0], lng: [-81, -69] },
  'Costa Rica': { lat: [8, 11], lng: [-86, -82] },
  'Panama': { lat: [7, 10], lng: [-83, -77] },
  'Belize': { lat: [16, 18], lng: [-89, -87] },
  'Guatemala': { lat: [14, 18], lng: [-92, -88] },
  'Honduras': { lat: [13, 16], lng: [-89, -83] },
  'Nicaragua': { lat: [11, 15], lng: [-88, -83] },
  
  // Africa
  'Nigeria': { lat: [4, 14], lng: [3, 15] },
  'Senegal': { lat: [12, 17], lng: [-17, -12] },
  'Gambia': { lat: [13, 14], lng: [-17, -13] },
  'Guinea-Bissau': { lat: [11, 12], lng: [-17, -14] },
  'Sierra Leone': { lat: [7, 10], lng: [-13, -11] },
  'Liberia': { lat: [4, 9], lng: [-12, -7] },
  'Ghana': { lat: [5, 11], lng: [-3, 1] },
  'Cameroon': { lat: [2, 13], lng: [9, 16] },
  'Gabon': { lat: [-4, 2], lng: [9, 15] },
  'Angola': { lat: [-18, -5], lng: [12, 24] },
  'Madagascar': { lat: [-26, -12], lng: [43, 51] },
  'Mozambique': { lat: [-27, -10], lng: [30, 41] },
  'Tanzania': { lat: [-11, -1], lng: [30, 40] },
  'Kenya': { lat: [-5, 5], lng: [34, 42] },
  
  // Middle East / Asia
  'Bangladesh': { lat: [21, 27], lng: [88, 93] },
  'India': { lat: [7, 37], lng: [68, 97] },
  'Pakistan': { lat: [24, 37], lng: [61, 75] },
  'Iran': { lat: [25, 40], lng: [44, 63] },
  'UAE': { lat: [22, 26], lng: [51, 56] },
  'Saudi Arabia': { lat: [16, 32], lng: [35, 56] },
  
  // Oceania
  'Australia': { lat: [-44, -10], lng: [113, 154] },
  'Papua New Guinea': { lat: [-11, -1], lng: [141, 156] },
  'New Zealand': { lat: [-47, -34], lng: [166, 179] }
};

// Function to determine country from coordinates
function getCountryFromCoordinates(lat, lng) {
  for (const [country, bounds] of Object.entries(COUNTRY_REGIONS)) {
    if (lat >= bounds.lat[0] && lat <= bounds.lat[1] && 
        lng >= bounds.lng[0] && lng <= bounds.lng[1]) {
      return country;
    }
  }
  return 'Unknown';
}

// Function to simplify polygon by reducing points (keep every nth point)
function simplifyPolygon(coordinates, factor = 3) {
  if (coordinates.length <= 10) return coordinates; // Don't simplify small polygons
  
  const simplified = [];
  for (let i = 0; i < coordinates.length; i += factor) {
    simplified.push(coordinates[i]);
  }
  
  // Always include the last point if it's not already included
  if (simplified[simplified.length - 1] !== coordinates[coordinates.length - 1]) {
    simplified.push(coordinates[coordinates.length - 1]);
  }
  
  return simplified;
}

// Function to round coordinates to reasonable precision (4 decimal places = ~10m accuracy)
function roundCoordinate(coord) {
  return Math.round(coord * 10000) / 10000;
}

// Function to round area/metrics to reasonable precision
function roundMetric(value, decimals = 2) {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

// Function to generate realistic environmental metrics based on location
function generateMetrics(lat, lng, area) {
  // Base health influenced by latitude (mangroves thrive in tropical regions)
  const latitudeFactor = Math.max(0.3, 1 - Math.abs(lat) / 30);
  
  // Random variation
  const randomFactor = 0.7 + Math.random() * 0.3;
  
  const health = roundMetric(latitudeFactor * randomFactor, 2);
  
  return {
    health: Math.min(0.95, Math.max(0.3, health)),
    flood_protection_m: roundMetric(health * (2 + Math.random() * 6), 1),
    carbon_sequestration_tpy: roundMetric(area * health * (0.5 + Math.random() * 1.5), 1),
    biodiversity_index: roundMetric(health * (0.6 + Math.random() * 0.3), 2),
    economic_value_usd: Math.round(area * health * (800 + Math.random() * 1200)),
    protection_level: health > 0.7 ? 'high' : health > 0.5 ? 'medium' : 'low'
  };
}

async function processGMWData() {
  console.log('🌿 Processing GMW v3 2020 data...');
  
  try {
    // Read the original GMW data
    const gmwPath = path.join(__dirname, 'gmw_v3_2020_vec.json');
    console.log('📖 Reading GMW data from:', gmwPath);
    
    const rawData = fs.readFileSync(gmwPath, 'utf8');
    const gmwData = JSON.parse(rawData);
    
    console.log(`📊 Original dataset contains ${gmwData.features.length} features`);
    
    // Filter valid features and sample up to MAX_FEATURES
    const validFeatures = gmwData.features
      .filter(feature => {
        return feature.geometry && 
               feature.geometry.coordinates && 
               feature.geometry.coordinates.length > 0;
      })
      .slice(0, MAX_FEATURES);
    
    console.log(`✅ Processing ${validFeatures.length} valid features`);
    
    // Process each feature
    const processedFeatures = validFeatures.map((feature, index) => {
      if (index % 10000 === 0) {
        console.log(`⚙️ Processing feature ${index + 1}/${validFeatures.length}`);
      }
      
      // Calculate centroid for coordinate-based operations
      let centroidLat = 0, centroidLng = 0, pointCount = 0;
      
      if (feature.geometry.type === 'Polygon') {
        feature.geometry.coordinates[0].forEach(coord => {
          centroidLng += coord[0];
          centroidLat += coord[1];
          pointCount++;
        });
      } else if (feature.geometry.type === 'MultiPolygon') {
        feature.geometry.coordinates.forEach(polygon => {
          polygon[0].forEach(coord => {
            centroidLng += coord[0];
            centroidLat += coord[1];
            pointCount++;
          });
        });
      }
      
      if (pointCount > 0) {
        centroidLat = roundCoordinate(centroidLat / pointCount);
        centroidLng = roundCoordinate(centroidLng / pointCount);
      }
      
      // Round all coordinates in geometry to reduce file size
      const roundedGeometry = {
        ...feature.geometry,
        coordinates: feature.geometry.type === 'Polygon' 
          ? [feature.geometry.coordinates[0].map(coord => [
              roundCoordinate(coord[0]), 
              roundCoordinate(coord[1])
            ])]
          : feature.geometry.coordinates.map(polygon => 
              [polygon[0].map(coord => [
                roundCoordinate(coord[0]), 
                roundCoordinate(coord[1])
              ])]
            )
      };
      
      // Calculate area (rough estimate)
      const area = feature.properties?.PXLVAL || (Math.random() * 500 + 50);
      const roundedArea = roundMetric(area, 1);
      
      // Get country
      const country = getCountryFromCoordinates(centroidLat, centroidLng);
      
      // Generate metrics
      const metrics = generateMetrics(centroidLat, centroidLng, roundedArea);
      
      // Create region name
      const regionId = String(index + 1).padStart(4, '0');
      const name = `${country} Mangrove ${regionId}`;
      
      return {
        type: 'Feature',
        properties: {
          name,
          country,
          area_hectares: roundedArea,
          ...metrics,
          // Keep original properties if useful
          ...(feature.properties?.PXLVAL && { PXLVAL: feature.properties.PXLVAL })
        },
        geometry: roundedGeometry
      };
    });
    
    // Create final GeoJSON
    const outputData = {
      type: 'FeatureCollection',
      features: processedFeatures
    };
    
    // Write processed data
    const outputPath = path.join(__dirname, 'efficient_mock_predictions.json');
    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
    
    // Calculate file size
    const stats = fs.statSync(outputPath);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    console.log('✨ Processing complete!');
    console.log(`📁 Output file: ${outputPath}`);
    console.log(`📏 File size: ${fileSizeMB} MB`);
    console.log(`🗺️ Features processed: ${processedFeatures.length}`);
    
    // Country distribution
    const countryCount = {};
    processedFeatures.forEach(f => {
      const country = f.properties.country;
      countryCount[country] = (countryCount[country] || 0) + 1;
    });
    
    console.log('🌍 Country distribution:');
    Object.entries(countryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([country, count]) => {
        console.log(`   ${country}: ${count} features`);
      });
    
  } catch (error) {
    console.error('❌ Error processing GMW data:', error.message);
    
    if (error.code === 'ENOENT') {
      console.error('📁 GMW data file not found. Please ensure gmw_v3_2020_vec.json exists in the data directory.');
    }
  }
}

// Run the processing
processGMWData();
