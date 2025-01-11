import Sidebar from '@/components/plan/Sidebar';
import AboutThePlace from '@/components/sections/AboutThePlace'
import BestTimeToVisit from '@/components/sections/BestTimeToVisit';
import ImageSection from '@/components/sections/ImageSection';
import Itinerary from '@/components/sections/Itinerary';
import LocalCuisineRecommendations from '@/components/sections/LocationCuisineRecommendations';
import PackingChecklist from '@/components/sections/PackingChecklist';
import TopPlacesToVisit from '@/components/sections/TopPlacesToVisit';
import Weather from '@/components/sections/Weather';
import TopActivities from '@/components/shared/TopActivites';
import React from 'react'

const Home = () => {

    const mockPlanData = {
        id: "12345",
        aboutThePlace: "Ujjain is one of the holiest cities in India, located in the state of Madhya Pradesh. It is renowned for its rich history and spiritual significance, particularly as a major pilgrimage site in Hinduism. The city is the home of the Mahakaleshwar Jyotirlinga, one of the twelve Jyotirlingas and a major attraction for thousands of devotees and tourists. Ujjain is also famous for the Kumbh Mela, a grand festival that occurs every 12 years, drawing millions of visitors. Its ancient temples, ghats along the Shipra River, and the vibrant markets reflect its cultural heritage and devotion. Visitors can explore historic sites such as the Calendar Museum and the ancient observatory, Jantar Mantar, which showcase the city’s commitment to astronomy and timekeeping. The city offers a unique blend of spirituality and history that captivates every traveler.",
        place:"Paris"
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
    <div>
<ImageSection        
userPrompt={mockPlan.userPrompt}
        companion={undefined}
        activityPreferences={mockActivityPreferences}
        fromDate={undefined}
        toDate={undefined}
        placeName={mockPlan.nameoftheplace}
        imageUrl={mockPlan.url}
        isLoading={false}
        allowEdit={true}
        planId={mockPlanId}
      />
      <AboutThePlace
              isLoading={false}
            //   planId={planId}
            planId={mockPlanData.id}
            //   content={plan.abouttheplace}
            content={mockPlanData.aboutThePlace}
              allowEdit={true}
            />
            <TopActivities
        activities={mockActivities}
        planId={mockPlanId}
        isLoading={mockIsLoading}
        allowEdit={mockAllowEdit}
      />
      
      <TopPlacesToVisit
      topPlacesToVisit={mockData}
      planId="123"
      isLoading={false}
      allowEdit={true}
    />
    
    <Itinerary
        itinerary={mockItinerary}
        planId={mockPlanData.id}
        isLoading={false}
        allowEdit={true}
      />
      <LocalCuisineRecommendations
          recommendations={mockCusine.localcuisinerecommendations}
          isLoading={false}
          planId={mockPlanData.id}
          allowEdit={false}
        />
        <PackingChecklist
        checklist={mockpacking.packingchecklist}
        isLoading={false}
        planId={mockPlanData.id}
        allowEdit={true}
      />
      <BestTimeToVisit
        content={mockBestTime.besttimetovisit}
        isLoading={false}
        planId={mockPlanData.id}
        allowEdit={true}
      />
      </div>
  )
}

export default Home