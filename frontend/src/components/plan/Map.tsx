import React, { useEffect, useState } from "react";
import { GoogleMap, useJsApiLoader, OverlayView } from "@react-google-maps/api";

// Define map dark mode styles
const MAPS_DARK_MODE_STYLES = [
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#242f3e" }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#746855" }]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#242f3e" }]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#d59563" }]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#d59563" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [{ "color": "#263c3f" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#6b9a76" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{ "color": "#38414e" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#212a37" }]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#9ca5b3" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [{ "color": "#746855" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#1f2835" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#f3d19c" }]
  },
  {
    "featureType": "transit",
    "elementType": "geometry",
    "stylers": [{ "color": "#2f3948" }]
  },
  {
    "featureType": "transit.station",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#d59563" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#17263c" }]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#515c6d" }]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#17263c" }]
  }
];

// Define colors for markers
const colors = [
  "#FF5733", // Orange-Red
  "#33FF57", // Lime Green
  "#3357FF", // Blue
  "#FF33A8", // Pink
  "#33A8FF", // Light Blue
  "#A833FF"  // Purple
];

// Define your place type
type TopPlace = {
  id: string;
  name: string;
  coordinates: { lat: number; lng: number };
};

interface MapProps {
  topPlacesToVisit: TopPlace[] | undefined;
  selectedPlace: { lat: number; lng: number } | undefined;
  darkMode?: boolean;
  planId?: string;
}

// MapPinMarker component
const MapPinMarker = ({ index }: { index: number }) => {
  return (
    <div
      aria-label="Map marker"
      className="relative cursor-pointer select-none"
      role="button"
      aria-expanded="false"
      style={{
        opacity: 1,
        pointerEvents: "auto",
      }}
    >
      <div className="transform-none">
        <div
          className="absolute flex h-8 w-8 -rotate-45 items-center justify-center rounded-full !rounded-bl-none border-4 border-solid border-white p-1 shadow-md"
          style={{ backgroundColor: colors[index % 6] }}
        >
          <p className="w-2.5 rotate-45 text-base font-bold text-white">{index + 1}</p>
        </div>
      </div>
    </div>
  );
};

// Map View Type Button
const MapViewButton = ({ 
  active, 
  onClick, 
  children 
}: { 
  active: boolean; 
  onClick: () => void; 
  children: React.ReactNode;
}) => {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-medium transition-colors duration-200 ${
        active 
          ? "bg-blue-600 text-white" 
          : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
      } rounded-md shadow-sm`}
    >
      {children}
    </button>
  );
};

// Main Map component
const Map: React.FC<MapProps> = ({ topPlacesToVisit, selectedPlace, darkMode = false, planId }) => {
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | undefined>(selectedPlace);
  const [mapZoom, setMapZoom] = useState(13);
  const [libraries] = useState<("places" | "drawing" | "geometry" | "visualization")[]>(["places"]);
  const [mapType, setMapType] = useState<string>('roadmap'); // Initialize as string

  // Load Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.GOOGLE_MAP_KEY,
    libraries
  });

  // Detect system dark mode preference
  const [systemDarkMode, setSystemDarkMode] = useState<boolean>(
    typeof window !== 'undefined' && window.matchMedia && 
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  // Use prop darkMode or fall back to system preference
  const effectiveDarkMode = darkMode !== undefined ? darkMode : systemDarkMode;

  // Get map types only after API is loaded
  const getMapType = () => {
    if (!isLoaded) return 'roadmap';
    return google.maps.MapTypeId[mapType.toUpperCase() as keyof typeof google.maps.MapTypeId];
  };

  // Update map type handler
  const handleMapTypeChange = (type: string) => {
    setMapType(type);
  };

  useEffect(() => {
    if (!selectedPlace) return;
    zoomSelectedPlace(selectedPlace.lat, selectedPlace.lng);
  }, [selectedPlace]);

  // Listen for system dark mode changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemDarkMode(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const zoomSelectedPlace = (lat: number, lng: number) => {
    setMapCenter({ lat, lng });
    setMapZoom(16);
  };

  // Handle loading and error states
  if (loadError) {
    return (
      <div className="w-full h-full flex flex-col gap-2 justify-center items-center bg-background text-center px-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span>Error loading Google Maps. Please check your API key.</span>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex flex-col gap-2 justify-center items-center bg-background text-center px-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
          <line x1="12" y1="2" x2="12" y2="6"></line>
          <line x1="12" y1="18" x2="12" y2="22"></line>
          <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
          <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
          <line x1="2" y1="12" x2="6" y2="12"></line>
          <line x1="18" y1="12" x2="22" y2="12"></line>
          <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
          <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
        </svg>
        <span>Loading Google Maps...</span>
      </div>
    );
  }

  // Default content when no places to visit
  if (!topPlacesToVisit || topPlacesToVisit.length === 0) {
    return (
      <div className="w-full h-full flex flex-col gap-2 justify-center items-center bg-background text-center px-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
        <span className="text-sm md:text-base">Search and select a location to add to places to visit</span>
      </div>
    );
  }

  // Render the map with places
  return (
    <div className="w-full h-full flex flex-col rounded-md overflow-hidden">
      {/* Map view toggle controls */}
      <div className="bg-white dark:bg-gray-900 p-2 flex gap-2 justify-center z-10">
        <MapViewButton 
          active={mapType === 'roadmap'} 
          onClick={() => handleMapTypeChange('roadmap')}
        >
          Map
        </MapViewButton>
        <MapViewButton 
          active={mapType === 'satellite'} 
          onClick={() => handleMapTypeChange('satellite')}
        >
          Satellite
        </MapViewButton>
        <MapViewButton 
          active={mapType === 'hybrid'} 
          onClick={() => handleMapTypeChange('hybrid')}
        >
          Hybrid
        </MapViewButton>
        <MapViewButton 
          active={mapType === 'terrain'} 
          onClick={() => handleMapTypeChange('terrain')}
        >
          Terrain
        </MapViewButton>
      </div>

      {/* Google Map */}
      {isLoaded && (
        <div className="flex-1">
          <GoogleMap
            mapContainerStyle={{ height: "100%", width: "100%" }}
            center={mapCenter}
            zoom={mapZoom}
            options={{
              styles: effectiveDarkMode ? MAPS_DARK_MODE_STYLES : [],
              disableDefaultUI: false,
              mapTypeId: getMapType(),
              clickableIcons: true,
              scrollwheel: true,
              mapTypeControl: false,
            }}
          >
            {topPlacesToVisit.map((place, index) => (
              <OverlayView
                position={place.coordinates}
                key={place.id}
                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
              >
                <MapPinMarker index={index} />
              </OverlayView>
            ))}
          </GoogleMap>
        </div>
      )}
    </div>
  );
};

export default Map;