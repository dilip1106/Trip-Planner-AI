import React, { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";

type Location = {
  lat: number;
  lng: number;
};

type TopPlace = {
  id?: string;
  name: string;
  coordinates: Location;
};

interface MapProps {
  selectedPlace?: Location;
  planId: string;
  topPlacesToVisit?: TopPlace[];
}

const Map: React.FC<MapProps> = ({ selectedPlace, planId, topPlacesToVisit }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [places, setPlaces] = useState<TopPlace[]>([]);
  const [mapElement, setMapElement] = useState<HTMLDivElement | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);

  // Fetch places from the API if they're not provided directly
  useEffect(() => {
    if (!topPlacesToVisit && planId) {
      fetchTopPlaces();
    } else if (topPlacesToVisit) {
      setPlaces(topPlacesToVisit);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [topPlacesToVisit, planId]);

  const fetchTopPlaces = async () => {
    if (!planId) return;
    
    try {
      const response = await fetch(`/api/plans/${planId}/topPlaces`);
      if (!response.ok) {
        throw new Error(`Failed to fetch places: ${response.statusText}`);
      }
      
      const data = await response.json();
      if (data && Array.isArray(data)) {
        setPlaces(data);
      }
    } catch (error) {
      console.error("Error fetching places:", error);
      toast({
        title: "Error",
        description: "Failed to load places. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize the map
  useEffect(() => {
    if (!mapElement) return;

    const initMap = () => {
      // Default to a fallback location if no selected place
      const defaultLocation = { lat: 40.7128, lng: -74.0060 }; // New York City
      const mapOptions = {
        center: selectedPlace || defaultLocation,
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
      };

      const newMap = new google.maps.Map(mapElement, mapOptions);
      setMap(newMap);
    };

    // Load Google Maps API if not already loaded
    if (window.google && window.google.maps) {
      initMap();
    } else {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.MAP_KEY}&libraries=places`;
      script.onload = initMap;
      document.head.appendChild(script);
    }
  }, [mapElement]);

  // Update map center when selected place changes
  useEffect(() => {
    if (!map || !selectedPlace) return;
    
    map.setCenter(selectedPlace);
    map.setZoom(14);
  }, [map, selectedPlace]);

  // Create or update markers for places
  useEffect(() => {
    if (!map || !places || places.length === 0) return;
    
    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    
    // Create new markers
    const newMarkers = places.map((place, index) => {
      // Skip if coordinates are missing or invalid
      if (!place.coordinates || typeof place.coordinates.lat !== 'number' || typeof place.coordinates.lng !== 'number') {
        console.warn(`Invalid coordinates for place: ${place.name || 'unnamed'}`);
        return null;
      }
      
      const marker = new google.maps.Marker({
        position: place.coordinates,
        map: map,
        title: place.name,
        label: {
          text: (index + 1).toString(),
          color: "white",
        },
        animation: google.maps.Animation.DROP,
      });
      
      // Add click event to the marker
      marker.addListener("click", () => {
        const infoWindow = new google.maps.InfoWindow({
          content: `<div><h3>${place.name}</h3></div>`,
        });
        infoWindow.open(map, marker);
      });
      
      return marker;
    }).filter(Boolean) as google.maps.Marker[];
    
    setMarkers(newMarkers);
    
    // If we have places but no selected place yet, use the first one
    if (places.length > 0 && !selectedPlace && places[0].coordinates) {
      map.setCenter(places[0].coordinates);
      map.setZoom(14);
    }
    
    // If we have multiple places, fit the map to show all markers
    if (places.length > 1) {
      const bounds = new google.maps.LatLngBounds();
      places.forEach(place => {
        if (place.coordinates && place.coordinates.lat && place.coordinates.lng) {
          bounds.extend(place.coordinates);
        }
      });
      map.fitBounds(bounds);
    }
  }, [map, places]);

  if (isLoading) {
    return <Skeleton className="h-full w-full" />;
  }

  return (
    <div className="h-full w-full rounded-lg overflow-hidden">
      <div
        ref={setMapElement}
        className="h-full w-full"
        style={{ borderRadius: "0.5rem" }}
      />
    </div>
  );
};

export default Map;