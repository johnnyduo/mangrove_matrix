// Test script to verify the mock predictions data is loading correctly
async function testDataLoading() {
  console.log('🌿 Testing MangroveMatrix Data Loading...');
  
  try {
    const response = await fetch('/mock_mangrove_predictions.json');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Data loaded successfully!');
    console.log(`📊 Features found: ${data.features?.length || 0}`);
    
    if (data.features && data.features.length > 0) {
      const firstFeature = data.features[0];
      console.log('🔍 First feature sample:', {
        name: firstFeature.properties.name,
        health: firstFeature.properties.health,
        flood_protection: firstFeature.properties.flood_protection_m,
        carbon_sequestration: firstFeature.properties.carbon_sequestration_tpy,
        biodiversity: firstFeature.properties.biodiversity_index,
        economic_value: firstFeature.properties.economic_value_usdpy,
        country: firstFeature.properties.country
      });
      
      // Test property mapping
      console.log('🔄 Testing property normalization...');
      const normalizeProperties = (props) => {
        return {
          name: props.name || props.Name || 'Unnamed Region',
          health: props.health ? props.health * 100 : props.health_index ? props.health_index * 100 : props.healthIndex || 75,
          flood_protection_m: props.flood_protection_m || props.floodProtection || 2.5,
          carbon_sequestration_tpy: props.carbon_sequestration_tpy || props.carbonSequestration || 50,
          biodiversity_index: props.biodiversity_index || props.biodiversityIndex || 0.7,
          economic_value_usd: props.economic_value_usdpy || props.economicValue || 100000,
          area_hectares: props.area_hectares || props.Area_Ha || 100,
          country: props.country || props.Country || 'Unknown',
          protection_level: props.protection_level || 'Unknown'
        };
      };
      
      const normalized = normalizeProperties(firstFeature.properties);
      console.log('✨ Normalized properties:', normalized);
    }
    
    console.log('🎉 Data integration test completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Data loading failed:', error);
    return false;
  }
}

// Auto-run the test
testDataLoading();
