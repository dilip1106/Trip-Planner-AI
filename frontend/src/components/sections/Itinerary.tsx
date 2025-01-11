import { useState, useEffect } from "react";
import Timeline from "@/components/Timeline";
import SectionWrapper from "@/components/sections/SectionWrapper";
import { AddIternaryDay } from "@/components/addNewItineraryDay/AddIternaryDay";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Navigation } from "lucide-react";

type ItineraryProps = {
  itinerary: Array<any> | undefined; // Replace with your specific data structure for itinerary
  planId: string;
  isLoading: boolean;
  allowEdit: boolean;
};

const Itinerary = ({ itinerary, planId, isLoading, allowEdit }: ItineraryProps) => {
  const [itineraryData, setItineraryData] = useState<Array<any> | undefined>(itinerary);

  // You can use this to fetch itinerary data if you need to do that (e.g., from an API)
  useEffect(() => {
    if (!itinerary) {
      // Fetch the itinerary data from your API if it's not passed as a prop
      const fetchItineraryData = async () => {
        try {
          const response = await fetch(`/api/plans/${planId}/itinerary`);
          const data = await response.json();
          setItineraryData(data); // Assuming the API returns an array of itinerary data
        } catch (error) {
          console.error("Error fetching itinerary data:", error);
        }
      };

      fetchItineraryData();
    }
  }, [itinerary, planId]);

  return (
    <SectionWrapper id="itinerary">
      <div className="mb-2 flex justify-between items-center">
        <h2 className="text-lg font-semibold tracking-wide flex items-center">
          <Navigation className="mr-2" /> Itinerary
        </h2>
        {allowEdit && !isLoading && <AddIternaryDay planId={planId} />}
      </div>
      {!isLoading ? (
        <Timeline itinerary={itineraryData} planId={planId} allowEdit={allowEdit} />
      ) : (
        <Skeleton className="w-full h-full" />
      )}
    </SectionWrapper>
  );
};

export default Itinerary;
