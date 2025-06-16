import fs from 'fs';

// Read the GeoJSON file
const centroidsData = fs.readFileSync('./gmw_v3_2020_vec.json', 'utf8');
const centroids = JSON.parse(centroidsData);

function randomFloat(min, max, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Limit to first 100,000 features to stay under GitHub's 100MB limit
const features = centroids.features.slice(0, 100000).map((f) => {
  return {
    ...f,
    properties: {
      ...f.properties,
      flood_protection_m: randomFloat(1.5, 4.5),
      carbon_sequestration_tpy: randomFloat(20, 80),
      biodiversity_index: randomFloat(0.5, 1, 2),
      economic_value_usdpy: randomInt(50000, 250000),
      health: randomFloat(0.5, 1, 2) // Add health index between 0.5 and 1
    }
  };
});

const output = {
  type: 'FeatureCollection',
  features
};

fs.writeFileSync('./mock_mangrove_predictions.json', JSON.stringify(output, null, 2));
console.log('Mock mangrove predictions generated!');
