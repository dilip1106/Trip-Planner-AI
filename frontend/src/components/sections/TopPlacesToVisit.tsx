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
import { MapPin } from "lucide-react"; // Import this to use MapPin icon

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

  useEffect(() => {
    if (!doesTopPlacesToVisitExist) return;
    setSelectedPlace(topPlacesToVisit[0].coordinates);
    const places = topPlacesToVisit.map((place) => ({ ...place, id: uuidv4() }));
    setTopPlaces(places);
  }, [doesTopPlacesToVisitExist, topPlacesToVisit]);

  const onClickPlace = (e: React.MouseEvent<HTMLLIElement>, coordinates: Location) => {
    e.preventDefault();
    setSelectedPlace(coordinates);
  };

  const addNewPlaceToTopPlaces = (lat: number, lng: number, placeName: string) => {
    setTopPlaces((places) => [
      ...places,
      { id: uuidv4(), coordinates: { lat, lng }, name: placeName },
    ]);
  };

  const handleDeletePlace = (id: string) => {
    if (!topPlaces) return;
    setIsDeleting(true);
    const updatedPlaces = topPlaces.filter((place) => place.id !== id);

    // Assuming you have a function to delete the place from your backend
    deletePlaceFromBackend(planId, updatedPlaces)
      .then(() => {
        setTopPlaces(updatedPlaces);
        setIsDeleting(false);
      })
      .catch((error) => {
        console.error(error);
        setIsDeleting(false);
      });

    toast({
      description: `Deleting the place to visit!`,
    });
  };

  const deletePlaceFromBackend = async (planId: string, updatedPlaces: any[]) => {
    // Make the API call to your backend here to update the places
    await fetch(`/api/plans/${planId}/updateTopPlaces`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ topPlaces: updatedPlaces }),
    });
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
                  {topPlaces?.map((place, index) => (
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
                  ))}
                </ol>
              </ScrollArea>
            </div>
          )}
        </div>
        <div className="w-full p-2 h-[30rem]">
          <Map selectedPlace={selectedPlace ?? undefined} planId={""} topPlacesToVisit={undefined} />
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
