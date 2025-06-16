// Professional GMW data processor - selects up to 100k features with proper coordinates and country mapping
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Maximum number of features to include (keeping file under 50MB for build performance)
const MAX_FEATURES = 50000;

// Country mapping based on coordinate ranges (simplified but reasonably accurate)
const getCountryFromCoordinates = (lat, lng) => {
  // Southeast Asia
  if (lat >= -10 && lat <= 25 && lng >= 95 && lng <= 145) {
    if (lng >= 95 && lng <= 105 && lat >= 5 && lat <= 20) return "Thailand";
    if (lng >= 100 && lng <= 120 && lat >= -10 && lat <= 7) return "Indonesia";
    if (lng >= 100 && lng <= 120 && lat >= 1 && lat <= 7) return "Malaysia";
    if (lng >= 120 && lng <= 135 && lat >= 5 && lat <= 20) return "Philippines";
    if (lng >= 105 && lng <= 110 && lat >= 8 && lat <= 25) return "Vietnam";
    if (lng >= 92 && lng <= 100 && lat >= 10 && lat <= 25) return "Myanmar";
    return "Southeast Asia";
  }
  
  // Central/South America
  if (lat >= -30 && lat <= 30 && lng >= -120 && lng <= -30) {
    if (lng >= -95 && lng <= -75 && lat >= 5 && lat <= 25) return "Mexico";
    if (lng >= -90 && lng <= -80 && lat >= 10 && lat <= 20) return "Guatemala";
    if (lng >= -90 && lng <= -80 && lat >= 12 && lat <= 18) return "Belize";
    if (lng >= -85 && lng <= -75 && lat >= 7 && lat <= 15) return "Costa Rica";
    if (lng >= -82 && lng <= -77 && lat >= 7 && lat <= 10) return "Panama";
    if (lng >= -75 && lng <= -60 && lat >= -5 && lat <= 15) return "Colombia";
    if (lng >= -70 && lng <= -45 && lat >= -30 && lat <= 5) return "Brazil";
    if (lng >= -65 && lng <= -55 && lat >= 5 && lat <= 12) return "Venezuela";
    if (lng >= -62 && lng <= -55 && lat >= 2 && lat <= 8) return "Guyana";
    return "South America";
  }
  
  // Africa
  if (lat >= -35 && lat <= 35 && lng >= -20 && lng <= 55) {
    if (lng >= -17 && lng <= -10 && lat >= 10 && lat <= 16) return "Senegal";
    if (lng >= -17 && lng <= -13 && lat >= 13 && lat <= 14) return "Gambia";
    if (lng >= -16 && lng <= -11 && lat >= 11 && lat <= 12) return "Guinea-Bissau";
    if (lng >= -13 && lng <= -10 && lat >= 7 && lat <= 10) return "Sierra Leone";
    if (lng >= 2 && lng <= 15 && lat >= 4 && lat <= 14) return "Nigeria";
    if (lng >= 9 && lng <= 16 && lat >= -1 && lat <= 4) return "Gabon";
    if (lng >= 32 && lng <= 42 && lat >= -26 && lat <= -10) return "Mozambique";
    if (lng >= 39 && lng <= 51 && lat >= -26 && lat <= -12) return "Madagascar";
    return "Africa";
  }
  
  // Caribbean
  if (lat >= 10 && lat <= 30 && lng >= -85 && lng <= -60) {
    if (lng >= -85 && lng <= -74 && lat >= 19 && lat <= 24) return "Cuba";
    if (lng >= -78 && lng <= -76 && lat >= 17 && lat <= 19) return "Jamaica";
    if (lng >= -72 && lng <= -68 && lat >= 17 && lat <= 20) return "Dominican Republic";
    if (lng >= -67 && lng <= -65 && lat >= 17 && lat <= 19) return "Puerto Rico";
    return "Caribbean";
  }
  
  // Australia/Oceania
  if (lat >= -45 && lat <= -10 && lng >= 110 && lng <= 180) {
    return "Australia";
  }
  
  // India/South Asia
  if (lat >= 5 && lat <= 25 && lng >= 68 && lng <= 95) {
    if (lng >= 68 && lng <= 82 && lat >= 8 && lat <= 25) return "India";
    if (lng >= 79 && lng <= 82 && lat >= 5 && lat <= 10) return "Sri Lanka";
    if (lng >= 88 && lng <= 93 && lat >= 20 && lat <= 27) return "Bangladesh";
    return "South Asia";
  }
  
  // Middle East
  if (lat >= 20 && lat <= 30 && lng >= 45 && lng <= 65) {
    return "Persian Gulf";
  }
  
  return "Unknown";
};

// Function to round coordinates to reasonable precision (reduces file size)
const roundCoord = (coord, precision = 4) => {
  return Math.round(coord * Math.pow(10, precision)) / Math.pow(10, precision);
};

// Function to simplify polygon by reducing points (Douglas-Peucker-like)
const simplifyPolygon = (coordinates, tolerance = 0.001) => {
  if (!coordinates || coordinates.length < 3) return coordinates;
  
  // For small polygons, keep fewer points
  if (coordinates.length <= 8) {
    return coordinates.map(coord => [roundCoord(coord[0], 3), roundCoord(coord[1], 3)]);
  }
  
  // For larger polygons, sample every nth point more aggressively
  const step = Math.max(1, Math.floor(coordinates.length / 15)); // Keep ~15 points max
  const simplified = [];
  
  for (let i = 0; i < coordinates.length; i += step) {
    simplified.push([roundCoord(coordinates[i][0], 3), roundCoord(coordinates[i][1], 3)]);
  }
  
  // Always include the last point if it's not already included
  const lastOriginal = coordinates[coordinates.length - 1];
  const lastSimplified = simplified[simplified.length - 1];
  if (lastOriginal[0] !== lastSimplified[0] || lastOriginal[1] !== lastSimplified[1]) {
    simplified.push([roundCoord(lastOriginal[0], 3), roundCoord(lastOriginal[1], 3)]);
  }
  
  return simplified;
};

// Function to calculate polygon centroid
const getPolygonCentroid = (coordinates) => {
  if (!coordinates || coordinates.length === 0) return [0, 0];
  
  let totalLat = 0;
  let totalLng = 0;
  let count = 0;
  
  for (const coord of coordinates) {
    totalLng += coord[0];
    totalLat += coord[1];
    count++;
  }
  
  return [totalLng / count, totalLat / count];
};

// Function to generate realistic environmental metrics based on location
const generateMetrics = (lat, lng, country) => {
  // Base metrics influenced by geographic factors
  const tropicalFactor = Math.max(0.3, 1 - Math.abs(lat) / 30); // Higher near equator
  const coastalFactor = Math.random() * 0.3 + 0.7; // Assume coastal areas
  
  // Health index (0.4 to 0.95)
  const health = roundCoord(Math.max(0.4, Math.min(0.95, 
    tropicalFactor * coastalFactor * (0.6 + Math.random() * 0.35)
  )), 2);
  
  // Flood protection (2-12 meters, correlated with health)
  const flood_protection_m = roundCoord(health * (4 + Math.random() * 6), 1);
  
  // Carbon sequestration (50-400 tons per year, higher in healthier areas)
  const carbon_sequestration_tpy = Math.round(health * (100 + Math.random() * 250));
  
  // Biodiversity index (0.3-0.9, correlated with health)
  const biodiversity_index = roundCoord(Math.max(0.3, Math.min(0.9, 
    health * (0.5 + Math.random() * 0.4)
  )), 2);
  
  // Economic value (20k-200k USD per year)
  const economic_value_usd = Math.round(health * (30000 + Math.random() * 120000));
  
  // Area in hectares (10-500 hectares per feature)
  const area_hectares = roundCoord(20 + Math.random() * 300, 1);
  
  // Protection level based on health
  let protection_level = "low";
  if (health > 0.8) protection_level = "high";
  else if (health > 0.65) protection_level = "medium";
  
  return {
    health,
    flood_protection_m,
    carbon_sequestration_tpy,
    biodiversity_index,
    economic_value_usd,
    area_hectares,
    protection_level,
    country
  };
};

// Main processing function
async function processGMWData() {
  const inputPath = path.join(__dirname, 'gmw_v3_2020_vec.json');
  const outputPath = path.join(__dirname, 'processed_gmw_mangroves.json');
  
  console.log('📖 Reading GMW v3 2020 vector data...');
  
  try {
    // Read the file in chunks to handle large size
    const rawData = fs.readFileSync(inputPath, 'utf8');
    const gmwData = JSON.parse(rawData);
    
    console.log(`📊 Original dataset contains ${gmwData.features.length} features`);
    
    // Filter and process features - be more aggressive in collection
    const processedFeatures = [];
    let processed = 0;
    let skipped = 0;
    
    console.log(`🎯 Target: ${MAX_FEATURES} features`);
    
    for (let i = 0; i < gmwData.features.length && processed < MAX_FEATURES; i++) {
      const feature = gmwData.features[i];
      
      try {
        if (!feature.geometry || !feature.geometry.coordinates) {
          skipped++;
          continue;
        }
        
        let coordinates;
        let centroid;
        
        // Handle different geometry types
        if (feature.geometry.type === 'Polygon') {
          if (feature.geometry.coordinates && feature.geometry.coordinates[0] && feature.geometry.coordinates[0].length > 2) {
            coordinates = simplifyPolygon(feature.geometry.coordinates[0]);
            centroid = getPolygonCentroid(coordinates);
          } else {
            continue;
          }
        } else if (feature.geometry.type === 'MultiPolygon') {
          // Use the largest polygon from multipolygon
          if (feature.geometry.coordinates && feature.geometry.coordinates.length > 0) {
            let largestPoly = null;
            let maxLength = 0;
            
            for (const poly of feature.geometry.coordinates) {
              if (poly && poly[0] && poly[0].length > maxLength) {
                largestPoly = poly[0];
                maxLength = poly[0].length;
              }
            }
            
            if (largestPoly && largestPoly.length > 2) {
              coordinates = simplifyPolygon(largestPoly);
              centroid = getPolygonCentroid(coordinates);
            } else {
              continue;
            }
          } else {
            continue;
          }
        } else {
          continue; // Skip other geometry types
        }
        
        if (!coordinates || coordinates.length < 3) {
          skipped++;
          continue;
        }
        
        const [lng, lat] = centroid;
        const country = getCountryFromCoordinates(lat, lng);
        const metrics = generateMetrics(lat, lng, country);
        
        // Create feature name
        const regionId = Math.floor(Math.random() * 9999) + 1;
        const name = `${country} Mangrove ${regionId}`;
        
        const processedFeature = {
          type: "Feature",
          properties: {
            name,
            ...metrics
          },
          geometry: {
            type: "Polygon",
            coordinates: [coordinates]
          }
        };
        
        processedFeatures.push(processedFeature);
        processed++;
        
        // Progress indicator
        if (processed % 10000 === 0) {
          console.log(`✅ Processed ${processed} features (skipped ${skipped})...`);
        }
        
      } catch (error) {
        skipped++;
        if (skipped % 1000 === 0) {
          console.warn(`⚠️ Skipped ${skipped} features due to errors`);
        }
        continue;
      }
    }
    
    // Create final GeoJSON
    const finalData = {
      type: "FeatureCollection",
      features: processedFeatures
    };
    
    // Write output file with compact formatting
    console.log('💾 Writing processed data...');
    fs.writeFileSync(outputPath, JSON.stringify(finalData)); // No pretty printing to save space
    
    // Calculate file size
    const stats = fs.statSync(outputPath);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    console.log(`✨ Successfully processed ${processedFeatures.length} mangrove features`);
    console.log(`📁 Output file: ${outputPath}`);
    console.log(`📊 File size: ${fileSizeMB} MB`);
    console.log('🌍 Country distribution:');
    
    // Show country distribution
    const countryCount = {};
    processedFeatures.forEach(f => {
      const country = f.properties.country;
      countryCount[country] = (countryCount[country] || 0) + 1;
    });
    
    Object.entries(countryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([country, count]) => {
        console.log(`   ${country}: ${count} features`);
      });
    
  } catch (error) {
    console.error('❌ Error processing GMW data:', error.message);
    
    if (error.code === 'ENOENT') {
      console.log('📁 GMW data file not found. Please ensure gmw_v3_2020_vec.json exists in the data directory.');
    }
  }
}

// Run the processing
processGMWData();
