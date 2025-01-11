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
        const response = await fetch(`/api/plans/${planId}?public=true`); // Replace with your actual endpoint
        if (!response.ok) {
          throw new Error(`Failed to fetch plan: ${response.statusText}`);
        }
        const data = await response.json();
        setPlan(data);
      } catch (err: any) {
        setError(err.message);
        setPlan(null);
      } finally {
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


  const mockPlanData = {
    id: "12345",
    aboutThePlace: "Ujjain is one of the holiest cities in India, located in the state of Madhya Pradesh. It is renowned for its rich history and spiritual significance, particularly as a major pilgrimage site in Hinduism. The city is the home of the Mahakaleshwar Jyotirlinga, one of the twelve Jyotirlingas and a major attraction for thousands of devotees and tourists. Ujjain is also famous for the Kumbh Mela, a grand festival that occurs every 12 years, drawing millions of visitors. Its ancient temples, ghats along the Shipra River, and the vibrant markets reflect its cultural heritage and devotion. Visitors can explore historic sites such as the Calendar Museum and the ancient observatory, Jantar Mantar, which showcase the city’s commitment to astronomy and timekeeping. The city offers a unique blend of spirituality and history that captivates every traveler.",
  };
  
  const mockActivities = [
    "Bungee Jumping at Ujjain Adventure Park",
    "Trekking in the Vindhya Range near Ujjain",
    "Boating on the Shipra River",
    "Exploring the historical ruins of the ancient city of Ujjain",
    "Cycling around the Mahakaleshwar Temple"
  ];
  
  const mockPlanId = "plan12345";  // A mock Plan ID
  
  const mockIsLoading = false;  // Set to false to show activities immediately
  const mockAllowEdit = true;  // Allows editing of activities
  
  // Now you can pass this mock data to your TopActivities component:
  
  const mockData = [
    { name: "Eiffel Tower", coordinates: { lat: 48.8584, lng: 2.2945 } },
    { name: "Great Wall of China", coordinates: { lat: 40.4319, lng: 116.5704 } },
    { name: "Colosseum", coordinates: { lat: 41.8902, lng: 12.4922 } },
  ];
  const mockItinerary = [
    {
      title: "Day 1: Arrival and City Exploration",
      activities: {
        morning: [
          {
            itineraryItem: "Arrive in Ujjain and check into your hotel",
            briefDescription: "Settle into your accommodations and prepare for a day of exploration."
          },
          {
            itineraryItem: "Visit Mahakaleshwar Temple",
            briefDescription: "A famous Hindu temple dedicated to Lord Shiva, known for its unique 'Shivling'."
          }
        ],
        afternoon: [
          {
            itineraryItem: "Lunch at a local restaurant",
            briefDescription: "Enjoy traditional Malwi cuisine, including dishes like dal bafla and poha."
          },
          {
            itineraryItem: "Explore the Ujjain Observatory (Vedh Shala)",
            briefDescription: "Learn about ancient astronomy and enjoy stunning views of the city."
          }
        ],
        evening: [
          {
            itineraryItem: "Attend the evening Aarti at Mahakaleshwar Temple",
            briefDescription: "Experience the spiritual ambiance with devotees during this mesmerizing ritual."
          },
          {
            itineraryItem: "Stroll along the banks of the Shipra River",
            briefDescription: "Relax and enjoy the serene atmosphere, especially during sunset."
          }
        ]
      }
    },
    {
      title: "Day 2: Cultural and Historical Insights",
      activities: {
        morning: [
          {
            itineraryItem: "Visit the Sandipani Ashram",
            briefDescription: "A historical site known as the place of education of Lord Krishna and his friends."
          },
          {
            itineraryItem: "Explore Bhartrihari Cave",
            briefDescription: "A sacred site associated with the ancient poet Bhartrihari."
          }
        ],
        afternoon: [
          {
            itineraryItem: "Lunch at a local café",
            briefDescription: "Try more local flavors and recharge for the afternoon."
          },
          {
            itineraryItem: "Visit the Kalidasa Academy",
            briefDescription: "Discover literature and art exhibitions related to the famous poet Kalidasa."
          }
        ],
        evening: [
          {
            itineraryItem: "Shopping at the local markets",
            briefDescription: "Explore vibrant markets for handicrafts, jewelry, and religious items."
          },
          {
            itineraryItem: "Enjoy dinner at a rooftop restaurant",
            briefDescription: "Savor delicious food with a view of the city illuminated at night."
          }
        ]
      }
    }
    // Add additional days here if needed
  ];
  
  
  const mockCusine = {
    id: "mockPlan123", // Mock plan ID
    localcuisinerecommendations: [
      "Dal Bafla",
      "Chakki Ki Sabzi",
      "Poha Jalebi",
      "Bhutte Ki Kees",
      "Samosa",
    ],
  };
  const mockpacking = {
    id: "mockPlan123", // Mock plan ID
    packingchecklist: [
      "Comfortable walking shoes",
      "Lightweight clothing",
      "Sunscreen",
      "Hat or cap",
      "Water bottle",
      "Camera",
      "First-aid kit",
      "Personal toiletries",
      "Medication if needed",
    ],
  };
  
  // Usage in your component
  
  const mockBestTime = {
    id: "mockPlan123", // Mock plan ID
    besttimetovisit: "The best time to visit Ujjain is between October and March when the weather is pleasant, making it ideal for sightseeing and pilgrimage activities.",
  };
  
  // Usage example:
  
  const mockPlan = {
    userPrompt: "Explore the best spots in Paris for photography enthusiasts.",
    nameoftheplace: "Paris, France",
    url: "https://media.istockphoto.com/id/1347242772/photo/sunset-in-autumn-paris.jpg?s=612x612&w=0&k=20&c=ZQzmnKrxM4d7k7iskYQo5FCEFRDj4HGtPdpMXtdCUeA=",
  };
  
  
  
  
  
  const mockActivityPreferences = [
    "sightseeing","culturalexperiences","historical","shopping"
  ];
  
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
          allowEdit={false}
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
