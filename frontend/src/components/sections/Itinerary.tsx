import { useState, useEffect } from "react";
import Timeline from "@/components/Timeline";
import SectionWrapper from "@/components/sections/SectionWrapper";
import { AddIternaryDay } from "@/components/addNewItineraryDay/AddIternaryDay";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Navigation } from "lucide-react";
import { useQuery, useQueryClient } from "react-query";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-react";

type ItineraryProps = {
  initialItinerary?: Array<any>;
  planId: string;
  isLoading: boolean;
  allowEdit: boolean;
};

const Itinerary = ({ initialItinerary, planId, isLoading: externalLoading, allowEdit }: ItineraryProps) => {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const queryClient = useQueryClient();
  
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

  // Use React Query to fetch and cache itinerary data
  const { data, isLoading: queryLoading } = useQuery(
    ['plan', planId],
    async () => {
      const userData = getUserData();
      if (!userData) throw new Error("Authentication required");
      
      const response = await axios.post(`http://localhost:5000/api/plan/${planId}/view`, {
        userData
      });
      
      return response.data.data;
    },
    {
      initialData: initialItinerary ? { itinerary: initialItinerary } : undefined,
      enabled: !!planId && isSignedIn
    }
  );

  const isLoading = externalLoading || queryLoading;
  const itineraryData = data?.itinerary;

  return (
    <SectionWrapper id="itinerary">
      <div className="mb-2 flex justify-between items-center">
        <h2 className="text-lg font-semibold tracking-wide flex items-center">
          <Navigation className="mr-2" /> Itinerary
        </h2>
        {allowEdit && !isLoading && (
          <AddIternaryDay 
            planId={planId} 
            queryClient={queryClient}
          />
        )}
      </div>
      {!isLoading ? (
        <Timeline 
          itinerary={itineraryData} 
          planId={planId} 
          allowEdit={allowEdit} 
          queryClient={queryClient}
        />
      ) : (
        <Skeleton className="w-full h-full" />
      )}
    </SectionWrapper>
  );
};

export default Itinerary;