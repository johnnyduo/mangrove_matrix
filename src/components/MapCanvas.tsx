import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Tooltip } from './Tooltip';
import { MapboxTokenInput } from './MapboxTokenInput';
import { VerificationModal } from './VerificationModal';
import { DetailDrawer } from './DetailDrawer';
import { MAPBOX_TOKEN } from '../config/env';
import { MangroveRegion } from '@/types';
import { dataService } from '@/lib/dataService';

interface MapCanvasProps {
  onRegionClick: (region: MangroveRegion) => void;
  selectedRegion: MangroveRegion | null;
}

export const MapCanvas = ({ onRegionClick, selectedRegion }: MapCanvasProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [selectedLocationForVerification, setSelectedLocationForVerification] = useState<MangroveRegion | null>(null);
  const [tooltip, setTooltip] = useState({
    x: 0,
    y: 0,
    content: null,
    visible: false
  });
  const [mangrove2D, setMangrove2D] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerRegion, setDrawerRegion] = useState<any>(null);
  const [dataSource, setDataSource] = useState<'full' | 'sample' | 'fallback'>('fallback');
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to normalize properties for compatibility
  const normalizeProperties = (props: any): MangroveRegion => {
    return {
      name: props.name || props.Name || 'Unnamed Region',
      lat: 0, // Will be set from geometry
      lng: 0, // Will be set from geometry
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

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await dataService.loadMangroveData();
        const availability = await dataService.checkDataAvailability();
        setMangrove2D(data);
        setDataSource(availability.dataSource);
      } catch (error) {
        console.error('Failed to load mangrove data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !mangrove2D) return;

    // Filter out features with null or empty geometry, and limit for performance
    const filteredFeatures = mangrove2D.features.filter(
      (f: any) =>
        f.geometry &&
        ((f.geometry.type === 'Polygon' && f.geometry.coordinates.length > 0) ||
          (f.geometry.type === 'MultiPolygon' && f.geometry.coordinates.flat(1).length > 0))
    ).slice(0, 25000); // Limit to 25k features for smooth performance

    // Create centroid points for each polygon/multipolygon
    const centroidFeatures = filteredFeatures.map((f: any) => {
      let coords = [];
      if (f.geometry.type === 'Polygon') {
        coords = f.geometry.coordinates[0];
      } else if (f.geometry.type === 'MultiPolygon') {
        coords = f.geometry.coordinates[0][0]; // Use first ring of first polygon
      }
      // Calculate centroid
      const n = coords.length;
      const sum = coords.reduce((acc: [number, number], cur: [number, number]) => [acc[0] + cur[0], acc[1] + cur[1]], [0, 0]);
      const centroid = [sum[0] / n, sum[1] / n];
      return {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: centroid },
        properties: f.properties
      } as GeoJSON.Feature<GeoJSON.Point>;
    });

    const filteredGeoJSON: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: filteredFeatures
    };
    const centroidGeoJSON: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: centroidFeatures
    };

    // Set Mapbox access token
    mapboxgl.accessToken = MAPBOX_TOKEN;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-v9',
      projection: 'globe',
      zoom: 2,
      center: [30, 15],
      pitch: 45,
      bearing: 0,
      antialias: true
    });

    map.current.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    map.current.on('style.load', () => {
      map.current!.addSource('mangroves-2d', {
        type: 'geojson',
        data: filteredGeoJSON,
      });
      map.current!.addSource('mangroves-centroids', {
        type: 'geojson',
        data: centroidGeoJSON,
      });
      map.current!.addLayer({
        id: 'mangroves-2d-fill',
        type: 'fill',
        source: 'mangroves-2d',
        paint: {
          'fill-color': '#10B981',
          'fill-opacity': 0.6,
          'fill-outline-color': '#fff'
        },
        filter: ['==', '$type', 'Polygon']
      });
      map.current!.addLayer({
        id: 'mangroves-centroid-circle',
        type: 'circle',
        source: 'mangroves-centroids',
        paint: {
          'circle-radius': 8,
          'circle-color': [
            'case',
            ['has', 'health'],
            [
              'interpolate',
              ['linear'],
              ['get', 'health'],
              0.5, '#EF4444', // red for low health
              0.7, '#F59E0B', // yellow for medium
              0.85, '#10B981' // green for high
            ],
            '#10B981' // fallback
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
          'circle-blur': 0.2,
          'circle-opacity': 0.85
        }
      });
      // Click event for centroids - completely redesigned to eliminate blinking
      map.current.on('click', 'mangroves-centroid-circle', (e) => {
        if (e.features && e.features.length > 0) {
          // Immediately disable globe spinning to prevent any visual artifacts
          spinEnabled = false;
          featureClicked = true;
          
          // Completely prevent default behaviors
          if (e.originalEvent) {
            e.originalEvent.preventDefault();
            e.originalEvent.stopPropagation();
          }
          
          const feature = e.features[0] as any;
          const coords = feature.geometry && 'coordinates' in feature.geometry ? feature.geometry.coordinates : [0, 0];
          const [lng, lat] = coords;
          
          // Normalize the properties and add coordinates
          const normalizedRegion = normalizeProperties(feature.properties);
          normalizedRegion.lat = lat;
          normalizedRegion.lng = lng;
          
          // Cancel any ongoing animations immediately
          if (requestId) {
            cancelAnimationFrame(requestId);
          }
          
          // First, freeze the current view completely
          if (map.current) {
            // Save current state
            const currentState = {
              center: map.current.getCenter(),
              zoom: map.current.getZoom(),
              bearing: map.current.getBearing(),
              pitch: map.current.getPitch()
            };
            
            // Reset to the exact same state to stop any ongoing animations
            map.current.jumpTo(currentState);
            
            // After a short pause, smoothly move to the feature location
            setTimeout(() => {
              if (map.current) {
                map.current.flyTo({
                  center: [lng, lat],
                  zoom: currentState.zoom, // Maintain the current zoom level
                  duration: 1500,
                  essential: true,
                  easing: (t) => {
                    // Custom easing function for smoother animation
                    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
                  }
                });
              }
              
              // Re-enable spinning after the animation completes
              setTimeout(() => {
                spinEnabled = true;
              }, 2000);
            }, 100);
          }
          
          // Call the parent callback
          onRegionClick(normalizedRegion);
          
          // Also set local state for drawer
          setDrawerRegion({ ...feature.properties, lat, lng });
          setDrawerOpen(true);
          
          // No need for additional stopPropagation, already handled above
        }
      });
      map.current.on('mouseenter', 'mangroves-centroid-circle', () => {
        map.current!.getCanvas().style.cursor = 'pointer';
      });
      map.current.on('mouseleave', 'mangroves-centroid-circle', () => {
        map.current!.getCanvas().style.cursor = '';
      });
      // Fit map to bounds of polygons
      if (filteredFeatures.length > 0) {
        const allCoords = filteredFeatures.flatMap((f: any) =>
          f.geometry.type === 'Polygon'
            ? f.geometry.coordinates[0]
            : f.geometry.type === 'MultiPolygon'
            ? f.geometry.coordinates.flat(2)
            : []
        );
        const lons = allCoords.map((c: any) => c[0]);
        const lats = allCoords.map((c: any) => c[1]);
        const minLon = Math.min(...lons);
        const maxLon = Math.max(...lons);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        map.current.fitBounds([[minLon, minLat], [maxLon, maxLat]], { padding: 20 });
      }
    });

    // Completely redesigned globe rotation system - prevents blinking on interactions
    const secondsPerRevolution = 240;
    const maxSpinZoom = 5;
    const slowSpinZoom = 3;
    let userInteracting = false;
    let spinEnabled = true;
    let featureClicked = false; // Track if a feature was clicked
    let spinTimeout: NodeJS.Timeout | null = null; // For debouncing spin restarts
    let animating = false; // Track if currently in an animation
    
    // Animation state management
    const animationState = {
      lastFrameTimestamp: 0,
      rotationSpeed: 360 / secondsPerRevolution,
      pauseUntil: 0
    };

    function spinGlobe(timestamp = 0) {
      if (!map.current) return;
      
      // Never spin during feature interaction or while animations are in progress
      if (featureClicked || animating) {
        return;
      }
      
      // Respect pause periods
      if (timestamp < animationState.pauseUntil) {
        return;
      }
      
      const zoom = map.current.getZoom();
      if (spinEnabled && !userInteracting && zoom < maxSpinZoom) {
        // Calculate rotation based on time passed for smoother motion
        let rotationSpeed = animationState.rotationSpeed;
        
        // Adjust speed based on zoom level
        if (zoom > slowSpinZoom) {
          const zoomFactor = (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom);
          rotationSpeed *= zoomFactor;
        }
        
        // Using tiny incremental updates for ultra-smooth rotation
        const center = map.current.getCenter();
        center.lng -= rotationSpeed / 20; // Very small increments for smoothness
        
        // Use linear animation with no easing for consistent rotation
        map.current.easeTo({
          center,
          duration: 50, // Very short duration for continuous smoothness
          easing: (n) => n, // Linear easing
          animate: true
        });
      }
    }

    // Completely redesigned interaction handlers
    
    // Track interaction states more precisely
    map.current.on('mousedown', () => {
      userInteracting = true;
      // Pause spinning during user interaction
      spinEnabled = false;
    });
    
    map.current.on('dragstart', () => {
      userInteracting = true;
      spinEnabled = false;
      // Set animating state to prevent concurrent animations
      animating = true;
    });
    
    map.current.on('mouseup', () => {
      // Only resume if not in feature click mode
      if (!featureClicked) {
        userInteracting = false;
        // Add a longer delay before resuming rotation
        setTimeout(() => {
          animating = false;
          spinEnabled = true;
        }, 1000);
      }
    });
    
    map.current.on('touchend', () => {
      if (!featureClicked) {
        userInteracting = false;
        // Add a longer delay before resuming rotation
        setTimeout(() => {
          animating = false;
          spinEnabled = true;
        }, 1000);
      }
    });
    
    // More reliable handling of animation completion
    map.current.on('moveend', () => {
      // Mark animation as complete
      animating = false;
      
      // Only restart spinning with a delay if not a feature interaction
      if (!featureClicked && !userInteracting) {
        // Set a pause before resuming rotation
        animationState.pauseUntil = animationState.lastFrameTimestamp + 1000;
        
        // Resume spinning with fresh parameters
        setTimeout(() => {
          spinEnabled = true;
        }, 1000);
      }
    });

    // Complete rewrite of the animation system for ultra-smooth rotation
    let lastTime = 0;
    let requestId: number;
    
    // More sophisticated animation loop with better timing and handling of state changes
    function smoothSpinAnimation(time: number) {
      if (!map.current) return;
      
      // Initialize lastTime on first frame
      if (!lastTime) lastTime = time;
      
      const deltaTime = time - lastTime;
      animationState.lastFrameTimestamp = time;
      
      // Use variable frame rate based on system performance
      // but with a minimum threshold to prevent too rapid updates
      const frameThreshold = 40; // ms (about 25fps)
      
      if (deltaTime > frameThreshold) {
        lastTime = time;
        
        // Only spin if not currently in a feature click state
        if (!featureClicked && !animating && spinEnabled) {
          spinGlobe(time);
        }
      }
      
      // Continue the animation loop
      requestId = requestAnimationFrame(smoothSpinAnimation);
    }
    
    // Start the globe spinning with requestAnimationFrame for smoother animation
    // with a small delay to let the map initialize fully
    setTimeout(() => {
      requestId = requestAnimationFrame(smoothSpinAnimation);
    }, 1000);
    
    // Add to cleanup
    map.current.on('remove', () => {
      if (requestId) {
        cancelAnimationFrame(requestId);
      }
    });

    // Cleanup
    return () => {
      // Cancel any pending timeouts
      if (spinTimeout) clearTimeout(spinTimeout);
      
      // Cancel animation frame
      if (requestId) cancelAnimationFrame(requestId);
      
      // Remove map
      map.current?.remove();
    };
  }, [mangrove2D, onRegionClick]);

  return (
    <div className="absolute inset-0">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Clean Data Status Indicator */}
      <div className="absolute top-4 right-4 z-10">
        {isLoading ? (
          <div className="bg-blue-900/90 text-white px-3 py-2 rounded-lg text-sm backdrop-blur-sm flex items-center">
            <div className="animate-spin mr-2 h-4 w-4 border-2 border-blue-100 border-t-transparent rounded-full"></div>
            Loading mangrove data...
          </div>
        ) : (
          <div className="bg-green-900/80 text-green-100 px-3 py-2 rounded-lg text-sm backdrop-blur-sm">
            <div className="flex items-center">
              <div className="h-2 w-2 bg-green-400 rounded-full mr-2"></div>
              <span className="font-semibold">MangroveMatrix</span>
            </div>
            <div className="text-xs mt-1 opacity-80">
              {dataSource === 'full' 
                ? '50K real GMW features' 
                : dataSource === 'sample' 
                  ? 'Sample dataset loaded' 
                  : 'Demo data loaded'}
            </div>
          </div>
        )}
      </div>
      
      <Tooltip x={tooltip.x} y={tooltip.y} visible={tooltip.visible} content={tooltip.content} />
      <DetailDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} region={drawerRegion} />
      {/* Verification Modal */}
      {showVerificationModal && (
        <VerificationModal
          isOpen={showVerificationModal}
          onClose={() => setShowVerificationModal(false)}
          location={selectedLocationForVerification}
        />
      )}
    </div>
  );
};
