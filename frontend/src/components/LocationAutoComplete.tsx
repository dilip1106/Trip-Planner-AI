"use client";
import { Input } from "@/components/ui/input";
import { ChangeEvent, MouseEvent, useState } from "react";
import usePlacesService from "react-google-autocomplete/lib/usePlacesAutocompleteService";
import { Loading } from "@/components/shared/Loading";
import { Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";  // Assuming Axios is being used for API calls

type LocationAutoCompletePropType = {
  planId: string;
  addNewPlaceToTopPlaces: (lat: number, lng: number, placeName: string) => void;
};

const LocationAutoComplete = ({ planId, addNewPlaceToTopPlaces }: LocationAutoCompletePropType) => {
  const [showReults, setShowResults] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");

  // Handling Google Places API data
  const { placesService, placePredictions, getPlacePredictions, isPlacePredictionsLoading } = usePlacesService({
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });

  const handleSelectItem = (e: MouseEvent<HTMLLIElement>, placeId: string) => {
    e.stopPropagation();
    setShowResults(false);
    setIsSaving(true);

    const { dismiss } = toast({
      description: `Adding the selected place!`,
    });

    // Fetch place details from Google Places API
    placesService?.getDetails({ placeId }, (details) => {
      const lat = details?.geometry?.location?.lat();
      const lng = details?.geometry?.location?.lng();
      if (!lat || !lng || !details?.name) return;

      // Replace with your API call to save the new place to your backend
      axios
        .post("/api/places", { planId, name: details.name, lat, lng })
        .then(() => {
          setSearchQuery("");
          setIsSaving(false);
          dismiss();
          addNewPlaceToTopPlaces(lat, lng, details.name || "New Place");
        })
        .catch((error) => {
          console.error(error);
          setIsSaving(false);
          toast({ description: "Error saving the place, please try again!" });
        });
    });
  };

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value) {
      getPlacePredictions({ input: value });
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };

  return (
    <div className="relative">
      <div className="relative ">
        <Input
          disabled={isSaving}
          type="text"
          className="font-light h-12"
          placeholder="Search new location"
          onChange={handleSearch}
          value={searchQuery}
          onBlur={() => setShowResults(false)}
        />
        {isPlacePredictionsLoading ? (
          <div className="absolute right-3 top-0 h-full flex items-center">
            <Loading className="w-6 h-6" />
          </div>
        ) : (
          <div className="absolute right-3 top-0 h-full flex items-center">
            <Search className="w-4 h-4" />
          </div>
        )}
      </div>
      {showReults && (
        <div
          className="absolute w-full
        mt-2 shadow-md rounded-xl p-1 bg-background max-h-80 overflow-auto
        z-50"
          onMouseDown={(e) => e.preventDefault()}
        >
          <ul className="w-full flex flex-col gap-2" onMouseDown={(e) => e.preventDefault()}>
            {placePredictions.map((item) => (
              <li
                className="cursor-pointer
                border-b 
                flex justify-between items-center
                hover:bg-muted hover:rounded-lg
                px-1 py-2 text-sm"
                onClick={(e) => handleSelectItem(e, item.place_id)}
                key={item.place_id}
              >
                {item.description}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LocationAutoComplete;
