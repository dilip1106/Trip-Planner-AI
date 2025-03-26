import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
// import LocationAutoComplete from "@/components/LocationAutoComplete";
import Map from "@/components/plan/Map";
import SectionWrapper from "@/components/sections/SectionWrapper";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from "uuid";
import { MapPin } from "lucide-react";
import { useAuth, useUser } from "@clerk/clerk-react";
import axios from "axios";

type Location = {
  lat: number;
  lng: number;
};

type TopPlacesToVisitProps = {
  topPlacesToVisit: Array<{ name: string; coordinates: Location }> | undefined;
  planId: string;
  isLoading: boolean;
  allowEdit: boolean;
};

type TopPlace = {
  id: string;
  name: string;
  coordinates: Location;
};

const TopPlacesToVisit = ({
  topPlacesToVisit,
  planId,
  isLoading,
  allowEdit,
}: TopPlacesToVisitProps) => {
  const doesTopPlacesToVisitExist = topPlacesToVisit != null && topPlacesToVisit.length > 0;
  const [topPlaces, setTopPlaces] = useState<TopPlace[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Location | undefined>();
  const [isDeleting, setIsDeleting] = useState(false);
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  const NODE_URI=import.meta.env.VITE_NODE_ENV;
  const BASE_URL=NODE_URI === 'development' ? "http://localhost:5000" : "";

  useEffect(() => {
    if (!doesTopPlacesToVisitExist) return;
    setSelectedPlace(topPlacesToVisit[0].coordinates);
    const places = topPlacesToVisit.map((place) => ({ ...place, id: uuidv4() }));
    setTopPlaces(places);
  }, [doesTopPlacesToVisitExist, topPlacesToVisit]);

  // Function to get user data for the backend
  const getUserData = () => {
    if (!isSignedIn || !user) return null;
    
    const primaryEmail = user.emailAddresses.find(
      email => email.id === user.primaryEmailAddressId
    )?.emailAddress;

    return {
      clerkId: user.id,
      email: primaryEmail || "",
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      image: user.imageUrl
    };
  };

  const onClickPlace = (e: React.MouseEvent<HTMLLIElement>, coordinates: Location) => {
    e.preventDefault();
    setSelectedPlace(coordinates);
  };

  // const addNewPlaceToTopPlaces = async (lat: number, lng: number, placeName: string) => {
  //   const newPlace = { id: uuidv4(), coordinates: { lat, lng }, name: placeName };
  //   const updatedPlaces = [...topPlaces, newPlace];
    
  //   try {
  //     await updatePlacesInBackend(updatedPlaces);
  //     setTopPlaces(updatedPlaces);
  //     setSelectedPlace({ lat, lng });
      
  //     toast({
  //       description: `Added ${placeName} to your top places!`,
  //     });
  //   } catch (error) {
  //     console.error("Failed to add place:", error);
  //     toast({
  //       description: "Failed to add place. Please try again.",
  //       variant: "destructive"
  //     });
  //   }
  // };

  const handleDeletePlace = async (id: string) => {
    if (!topPlaces) return;
    setIsDeleting(true);
    
    try {
      // Filter out the place to be deleted
      const updatedPlaces = topPlaces.filter((place) => place.id !== id);
      
      // Update the database first
      await updatePlacesInBackend(updatedPlaces);
      
      // If database update was successful, update the local state
      setTopPlaces(updatedPlaces);
      
      // Update selected place if we deleted the currently selected one
      if (updatedPlaces.length > 0 && 
          selectedPlace && 
          !updatedPlaces.some(p => 
            p.coordinates.lat === selectedPlace.lat && 
            p.coordinates.lng === selectedPlace.lng
          )) {
        setSelectedPlace(updatedPlaces[0].coordinates);
      }
      
      toast({
        description: "Place removed successfully!",
      });
    } catch (error) {
      console.error("Failed to delete place:", error);
      toast({
        variant: "destructive",
        description: "Failed to remove place. Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const updatePlacesInBackend = async (updatedPlaces: TopPlace[]) => {
    const userData = getUserData();
    
    if (!userData) {
      throw new Error("User authentication required");
    }
    
    // Format the places data as your API expects
    const placesForAPI = updatedPlaces.map(place => ({
      name: place.name,
      coordinates: place.coordinates
    }));
    
    try {
      const response = await axios.put(
        `${BASE_URL}/api/plan/${planId}`,
        { 
          userData,
          topPlacesToVisit: placesForAPI // Changed from topPlaces to topPlacesToVisit to match API
        }
      );
  
      if (!response.data.success) {
        throw new Error(response.data.error || "Failed to update places.");
      }
  
      return response.data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  };

  return (
    <SectionWrapper id="topplacestovisit">
      <h2 className="mb-2 text-lg font-semibold tracking-wide flex items-center">
        <MapPin className="mr-2" /> Top places to visit
      </h2>

      <div className="flex flex-col bg-blue-50 dark:bg-background rounded-md lg:flex-row">
        <div className="w-full h-[30rem]">
          {isLoading ? (
            <SkeletonForTopPlacesToVisit />
          ) : (
            <div className="p-2 h-full flex justify-center items-start">
              <ScrollArea className="h-full w-full rounded-md border">
                <ol className="flex-1 flex flex-col gap-2 p-5">
                  {allowEdit && (
                    <li
                      key="addNewPlace"
                      className="dark:bg-muted bg-white font-bold cursor-pointer flex-1 shadow-md"
                    >
                      {/* <LocationAutoComplete
                        planId={planId}
                        addNewPlaceToTopPlaces={addNewPlaceToTopPlaces}
                      /> */}
                    </li>
                  )}
                  <hr className="font-bold text-black" />
                  {topPlaces.length > 0 ? (
                    topPlaces.map((place, index) => (
                      <li
                        key={place.id}
                        className="p-5 dark:bg-muted bg-white font-bold cursor-pointer flex-1 shadow-md hover:shadow-lg flex justify-between items-center hover:ring-2 hover:ring-blue-300 duration-500"
                        onClick={(e) => onClickPlace(e, place.coordinates)}
                      >
                        <div>
                          <span className="mr-2">{index + 1}.</span>
                          <span className="font-normal dark:text-muted-foreground">{place.name}</span>
                        </div>
                        {allowEdit && (
                          <Button
                            variant="outline"
                            disabled={isDeleting}
                            className="border-none hover:scale-110 duration-200 transition-all"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeletePlace(place.id);
                            }}
                          >
                            <Trash className="h-4 w-4 text-red-500 dark:text-white" />
                          </Button>
                        )}
                      </li>
                    ))
                  ) : (
                    <li className="p-4 text-center text-gray-500">
                      {allowEdit ? "Add your top places to visit using the search above" : "No places added yet"}
                    </li>
                  )}
                </ol>
              </ScrollArea>
            </div>
          )}
        </div>
        <div className="w-full p-2 h-[30rem]">
          <Map selectedPlace={selectedPlace}  topPlacesToVisit={topPlaces} />
        </div>
      </div>
    </SectionWrapper>
  );
};

export const SkeletonForTopPlacesToVisit = () => {
  return (
    <div className="flex flex-col gap-1 justify-center items-center h-full">
      <Skeleton className="h-full" />
      <Skeleton className="h-full" />
      <Skeleton className="h-full" />
      <Skeleton className="h-full" />
    </div>
  );
};

export default TopPlacesToVisit;