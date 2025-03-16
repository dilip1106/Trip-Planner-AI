import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import AboutThePlace from "../sections/AboutThePlace";
import TopActivities from "../shared/TopActivites";
import TopPlacesToVisit from "../sections/TopPlacesToVisit";
import Itinerary from "../sections/Itinerary";
import LocalCuisineRecommendations from "../sections/LocationCuisineRecommendations";
import PackingChecklist from "../sections/PackingChecklist";
import BestTimeToVisit from "../sections/BestTimeToVisit";
import ImageSection from "../sections/ImageSection";
import axios, { AxiosError } from "axios";

export default function CommunityPlan() {
  const [plan, setPlan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { planId } = useParams();
  
  if (!planId) {
    return <p>Plan ID is required</p>;
  }
  
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
  
  useEffect(() => {
    const fetchPlan = async () => {
      setIsLoading(true);
      try {
        const userData = getUserData();
        
        if (!userData) {
          // setError("Authentication required");
          setIsLoading(false);
          return;
        }
        
        // Send the userData in the request headers or as a POST request with the userData in the body
        const response = await axios.post(
          `http://localhost:5000/api/plan/${planId}/view`, 
          { userData }
        );
        
        setPlan(response.data.data);
      } catch (err: unknown) {
        console.error("Fetch error:", err);
        const errorMessage = 
          (err instanceof AxiosError && err.response?.data?.error) ||
          (err instanceof Error ? err.message : 'An error occurred');
        setError(errorMessage);
        setPlan(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPlan();
  }, [planId, isSignedIn, user]);
  
  if (isLoading) {
    return <p>Loading...</p>;
  }
  
  if (error) {
    return <p>Error Loading Plan: {error}</p>;
  }
  
  if (!plan) {
    return <p>Plan Not Found</p>;
  }
  
  return (
    <section className="h-full flex flex-col gap-10">
      <ImageSection
        userPrompt={plan?.userPrompt}
        companion={undefined}
        activityPreferences={[]}
        fromDate={undefined}
        toDate={undefined}
        placeName={plan?.nameoftheplace}
        // imageUrl={plan?.url}
        destinationImage={plan?.destinationImage}
        isLoading={false}
        allowEdit={false}
        planId={planId}
      />
      {plan.aboutThePlace && (
      <AboutThePlace
          isLoading={false}
          planId={planId}
          content={plan.aboutThePlace}
          allowEdit={true}
        />
      )}
      {plan.adventureActivities && (
        <TopActivities
          activities={plan.adventureActivities}
          planId={planId}
          isLoading={false}
          allowEdit={false}
        />
      )}
      {plan.topPlacesToVisit && (
        <TopPlacesToVisit
          topPlacesToVisit={plan.topPlacesToVisit}
          planId={planId}
          isLoading={false}
          allowEdit={false}
        />
      )}
      {plan.itinerary && (
        <Itinerary
          itinerary={plan.itinerary}
          planId={planId}
          isLoading={false}
          allowEdit={false}
        />
      )}
      {plan.localCuisine && (
        <LocalCuisineRecommendations
          recommendations={plan.localCuisine}
          isLoading={false}
          planId={planId}
          allowEdit={false}
        />
      )}
      {plan.packingChecklist && (
        <PackingChecklist
          checklist={plan.packingChecklist}
          isLoading={false}
          planId={planId}
          allowEdit={false}
        />
      )}
      {plan.bestTimeToVisit && (
        <BestTimeToVisit
          content={plan.bestTimeToVisit}
          planId={planId}
          isLoading={false}
          allowEdit={false}
        />
      )}
    </section>
  );
}