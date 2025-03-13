import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AboutThePlace from "../sections/AboutThePlace";
import TopActivities from "../shared/TopActivites";
import TopPlacesToVisit from "../sections/TopPlacesToVisit";
import Itinerary from "../sections/Itinerary";
import LocalCuisineRecommendations from "../sections/LocationCuisineRecommendations";
import PackingChecklist from "../sections/PackingChecklist";
import BestTimeToVisit from "../sections/BestTimeToVisit";
import ImageSection from "../sections/ImageSection";
import axios from "axios";

// type PlanProps = {
//   planId: string;
// };

export default function CommunityPlan() {
  const [plan, setPlan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { planId } = useParams<{ planId: string }>();

  if (!planId) {
    return <p>Plan ID is required</p>;
  }
  useEffect(() => {
    const fetchPlan = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`http://localhost:5000/api/plan/${planId}`); // Fix: Use 'plans'
        setPlan(response.data);
      } catch (err) {
        console.error("Fetch error:", err);
        const error = err instanceof Error ? err.message : 'An error occurred';
        setError(error);
        setPlan(null);
      } finally {
        console.log(plan);
        setIsLoading(false);
      }
    };
  
    fetchPlan();
  }, [planId]);
  

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
        imageUrl={plan?.url}
        isLoading={false}
        allowEdit={false}
        planId={planId}
      />
      {plan.abouttheplace && (
        <AboutThePlace
          isLoading={false}
          planId={planId}
          content={plan.abouttheplace}
          allowEdit={true}
        />
      )}
       {plan.adventuresactivitiestodo && (
        <TopActivities
          activities={plan.adventuresactivitiestodo}
          planId={planId}
          isLoading={false}
          allowEdit={false}
        />
      )}
      {plan.topplacestovisit && (
        <TopPlacesToVisit
          topPlacesToVisit={plan.topplacestovisit}
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
      {plan.localcuisinerecommendations && (
        <LocalCuisineRecommendations
          recommendations={plan.localcuisinerecommendations}
          isLoading={false}
          planId={planId}
          allowEdit={false}
        />
      )}
      {plan.packingchecklist && (
        <PackingChecklist
          checklist={plan.packingchecklist}
          isLoading={false}
          planId={planId}
          allowEdit={false}
        />
      )}
      {plan.besttimetovisit && (
        <BestTimeToVisit
          content={plan.besttimetovisit}
          planId={planId}
          isLoading={false}
          allowEdit={false}
        />
      )}
    </section>
  );
}
