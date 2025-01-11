"use client";
import { colors, MAPS_DARK_MODE_STYLES } from "@/lib/constants";
import { GoogleMap, useJsApiLoader, OverlayView } from "@react-google-maps/api";
import { MapPin } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import axios from "axios"; // Assuming Axios is being used for API calls

type MapProps = {
  planId: string;
  topPlacesToVisit: { id: string; coordinates: { lat: number; lng: number }; placeName: string }[] | undefined;
  selectedPlace: { lat: number; lng: number } | undefined;
};

export default function Map({ topPlacesToVisit, selectedPlace, planId }: MapProps) {
  const [mapCenter, setMapCenter] = useState(selectedPlace);
  const [mapZoom, setMapZoom] = useState(13);

  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!selectedPlace) return;
    zoomSelectedPlace(selectedPlace?.lat, selectedPlace?.lng);
  }, [selectedPlace]);

  const zoomSelectedPlace = (lat: number, lng: number) => {
    setMapCenter({ lat, lng });
    setMapZoom(16);
  };

  const fetchTopPlaces = async () => {
    try {
      const response = await axios.get(`/api/places/${planId}`);
      // Update state with fetched places
      setMapCenter({ lat: response.data[0]?.coordinates.lat, lng: response.data[0]?.coordinates.lng });
    } catch (error) {
      console.error("Error fetching places:", error);
    }
  };

  useEffect(() => {
    if (planId) {
      fetchTopPlaces();
    }
  }, [planId]);

  return topPlacesToVisit && topPlacesToVisit?.length > 0 ? (
    <GoogleMap
      mapContainerStyle={{ height: "100%", width: "100%" }}
      center={mapCenter}
      zoom={mapZoom}
      options={{
        styles: resolvedTheme === "dark" ? MAPS_DARK_MODE_STYLES : [],
        disableDefaultUI: false,
        clickableIcons: true,
        scrollwheel: true,
      }}
    >
      {topPlacesToVisit?.map((place, index) => (
        <OverlayView
          position={place.coordinates}
          key={place.id}
          mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
        >
          <MapPinMarker index={index} />
        </OverlayView>
      ))}
    </GoogleMap>
  ) : (
    <div className="w-full h-full flex flex-col gap-2 justify-center items-center bg-background text-balance px-2 text-center">
      <MapPin className="h-20 w-20" />
      <span>Search and select a location to add to places to visit</span>
    </div>
  );
}

const MapPinMarker = ({ index }: { index: number }) => {
  return (
    <div
      aria-label="Map marker"
      className="mapboxgl-marker"
      role="button"
      aria-expanded="false"
      style={{
        opacity: 1,
        pointerEvents: "auto",
      }}
    >
      <div style={{ transform: "none" }}>
        <div
          className="absolute flex h-[32px] w-[32px] rotate-[-45deg] items-center justify-center rounded-full !rounded-bl-none border-4 border-solid border-white p-1 shadow-[2px_2px_2px_-1px_rgba(0,0,0,0.43)]"
          style={{ backgroundColor: colors[index % 6] }}
        >
          <p className="w-[10px] rotate-[45deg] text-base font-bold text-white">{index + 1}</p>
        </div>
      </div>
    </div>
  );
};
