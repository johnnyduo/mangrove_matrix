// Utility to fetch and parse 3D GeoJSON for mangroves
export async function fetchMangrove3DGeoJSON() {
  const response = await fetch('/src/data/mock_mangroves_3d.geojson');
  if (!response.ok) throw new Error('Failed to load 3D mangrove geojson');
  return response.json();
}
